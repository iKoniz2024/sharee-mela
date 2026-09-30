"use client";

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { createGuestOrder, sendOrderInvoice } from "@/services/order.api";
import useCart from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getLocalCart, clearLocalCart } from "@/utils/localCart";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(11, "Phone must be at least 11 characters"),
  email: z.union([z.string().email("Invalid email address"), z.literal(""), z.undefined()]).optional().default(""),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  deliveryArea: z.enum(["inside_dhaka", "outside_dhaka"], { required_error: "Please select a delivery area" }),
});

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

import usePageTitle from "@/hooks/usePageTitle";
import { trackMetaPixelEvent } from "@/utils/metaPixel";

export default function Checkout({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Checkout");
  const router = useRouter();
  const { refetchCartCount } = useCart();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      deliveryArea: "inside_dhaka",
    },
  });

  const { data: cart, isLoading } = useQuery({
    queryKey: ["localCart"],
    queryFn: () => {
      const items = getLocalCart();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items, totalItems, totalPrice };
    },
  });

  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * (item.quantity ?? 1)),
    0
  );

  const FREE_SHIPPING_THRESHOLD = 1000;
  const SHIPPING_INSIDE_DHAKA = 60;
  const SHIPPING_OUTSIDE_DHAKA = 120;

  const watchedDeliveryArea = useWatch({ name: "deliveryArea", control });
  const isInsideDhaka = watchedDeliveryArea === "inside_dhaka";
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : (isInsideDhaka ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA);
  const total = totalPrice + shipping;

  useEffect(() => {
    if (items.length > 0) {
      const initVal = Number(total) > 0 ? Number(Number(total).toFixed(2)) : 0.01;
      trackMetaPixelEvent("InitiateCheckout", {
        value: initVal,
        currency: "BDT",
        content_type: "product",
        content_ids: items.map((i) => String(i.productId || "")),
        num_items: Number(totalItems || 1),
      });
    }
  }, [items.length]);

  const orderMutation = useMutation({
    mutationFn: createGuestOrder,
    onSuccess: (data) => {
      toast.success("Order placed successfully!");

      const purchaseValue = Number(total) > 0 ? Number(Number(total).toFixed(2)) : 0.01;

      // Client-side Purchase event
      trackMetaPixelEvent("Purchase", {
        value: purchaseValue,
        currency: "BDT",
        content_type: "product",
        content_ids: items.map((i) => String(i.productId || "")),
        contents: items.map((i) => ({
          id: String(i.productId || ""),
          quantity: Number(i.quantity || 1),
        })),
        num_items: Number(totalItems || 1),
      });

      clearLocalCart();
      refetchCartCount(0);
      router.push(`/orders/${data.insertedId}`);
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = e.path?.[e.path.length - 1];
          if (field) setError(field, { message: e.message });
        });
        toast.error("Please fix the errors below");
      } else {
        toast.error(data?.message || data?.error || "Failed to place order");
      }
    },
  });

  const onSubmit = (data) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    orderMutation.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
        colorImage: item.colorImage || "",
      })),
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
      },
      deliveryArea: data.deliveryArea,
      paymentMethod: "Cash on Delivery",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet><title>{`Checkout | ${siteName}`}</title></Helmet>
        <div className="mx-auto max-w-5xl">
          <CheckoutSkeleton />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet><title>{`Checkout | ${siteName}`}</title></Helmet>
        <div className="mx-auto max-w-5xl text-center py-20">
          <p className="text-sm text-muted-foreground">Your cart is empty. Add some products first.</p>
          <Button className="mt-4 rounded-lg" onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-6 lg:px-8 overflow-x-hidden w-full max-w-full">
      <Helmet><title>{`Checkout | ${siteName}`}</title></Helmet>
      <div className="mx-auto max-w-5xl w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            Checkout
          </motion.h1>
          <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/cart")}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Cart
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full overflow-hidden">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-5 w-full max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 lg:col-span-3 w-full min-w-0"
            >
              <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 shadow-sm overflow-hidden w-full max-w-full">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Shipping Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 w-full">
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <Input
                      {...register("fullName")}
                      placeholder="John Doe"
                      className={errors.fullName ? "border-gray-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-gray-600">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Phone *
                    </label>
                    <Input
                      {...register("phone")}
                      placeholder="+880 1XXXXXXXXX"
                      className={errors.phone ? "border-gray-500" : ""}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-gray-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Email (Optional - for invoice)
                    </label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com (optional)"
                      className={errors.email ? "border-gray-500" : ""}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-gray-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Address *
                    </label>
                    <Input
                      {...register("address")}
                      placeholder="123 Main Street, Apt 4B"
                      className={errors.address ? "border-gray-500" : ""}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-gray-600">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      City *
                    </label>
                    <Input
                      {...register("city")}
                      placeholder="Dhaka"
                      className={errors.city ? "border-gray-500" : ""}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-gray-600">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Delivery Area *
                    </label>
                    <select
                      {...register("deliveryArea")}
                      className="box-border flex h-10 w-full max-w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="inside_dhaka">inside Dhaka - ৳60</option>
                      <option value="outside_dhaka">outside Dhaka - ৳120</option>
                    </select>
                    {errors.deliveryArea && (
                      <p className="mt-1 text-xs text-gray-600">{errors.deliveryArea.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 shadow-sm overflow-hidden w-full max-w-full">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Payment Method
                </h2>
                <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3.5 sm:p-4 w-full">
                  <div className="size-4 shrink-0 rounded-full border-4 border-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground truncate">Pay when you receive</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 w-full min-w-0"
            >
              <div className="sticky top-24 rounded-xl border border-border bg-card p-3.5 sm:p-6 shadow-sm overflow-hidden w-full max-w-full">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h2>

                <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="size-10 sm:size-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs sm:text-sm font-medium text-foreground">
                        {formatBDT(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="shrink-0 font-medium text-foreground">{formatBDT(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping {isInsideDhaka ? "(Dhaka)" : "(Outside Dhaka)"}</span>
                    {isFreeShipping ? (
                      <span className="text-foreground font-medium">Free</span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium text-foreground">{formatBDT(shipping)}</span>
                    )}
                  </div>
                  {!isFreeShipping && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatBDT(FREE_SHIPPING_THRESHOLD - totalPrice)} more for free shipping
                    </p>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex items-baseline justify-between text-base font-bold text-foreground">
                      <span>Total</span>
                      <span className="shrink-0 font-bold">{formatBDT(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full rounded-lg"
                  size="lg"
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
