"use client";

import { useRouter, useParams } from 'next/navigation';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Package, MapPin, CreditCard, ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getOrderById, updateOrderStatus } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const statusColors = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-muted text-foreground border-border",
  processing: "bg-foreground text-background border-foreground",
  shipped: "bg-muted text-foreground border-border",
  delivered: "bg-primary text-primary-foreground border-primary",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function formatStatus(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetails({ children }) {
  const { siteName } = useSettings();
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderStatus }) => updateOrderStatus(id, orderStatus),
    onMutate: async ({ orderStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-order", id] });
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] });
      const previousOrder = queryClient.getQueryData(["admin-order", id]);
      const previousOrders = queryClient.getQueryData(["admin-orders"]);
      queryClient.setQueryData(["admin-order", id], (old) => {
        if (!old) return old;
        return { ...old, orderStatus };
      });
      queryClient.setQueryData(["admin-orders"], (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((o) => (o._id === id ? { ...o, orderStatus } : o));
        }
        return {
          ...old,
          orders: old.orders?.map((o) => (o._id === id ? { ...o, orderStatus } : o)) ?? [],
        };
      });
      return { previousOrder, previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(["admin-order", id], context.previousOrder);
      }
      if (context?.previousOrders) {
        queryClient.setQueryData(["admin-orders"], context.previousOrders);
      }
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
    onSuccess: () => {
      toast.success("Order status updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <Button className="mt-4 rounded-lg" onClick={() => router.push("/dashboard/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Order Details | ${siteName}`}</title>
      </Helmet>

      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => router.push("/dashboard/orders")}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to Orders
      </Button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative inline-block">
              <select
                value={order.orderStatus || "pending"}
                disabled={statusMutation.isPending}
                onChange={(e) =>
                  statusMutation.mutate({ orderStatus: e.target.value })
                }
                className={`appearance-none rounded-full border px-3 py-1.5 pr-8 text-sm font-medium ${
                  statusColors[order.orderStatus] || "bg-muted text-foreground"
                } cursor-pointer focus:outline-none`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-current" />
            </div>
          </div>
        </div>

        {order.orderStatus !== "cancelled" && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                        i <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="mt-1.5 text-[11px] capitalize text-muted-foreground">
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 ${
                        i < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {order.orderStatus === "cancelled" && (
          <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            This order has been cancelled.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Items ({order.totalItems})</h2>
              </div>
              <div className="divide-y divide-border">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.colorImage || item.thumbnail}
                      alt={item.title}
                      className="size-16 shrink-0 rounded-lg object-cover border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Qty: {item.quantity} &times; ৳{item.price?.toLocaleString()}</span>
                        {item.color && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                            Color: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      ৳{item.subtotal?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Order Total</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBDT(order.subtotal ?? order.totalPrice)}</span>
                </div>
                {order.shippingCost != null && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping {order.deliveryArea === "inside_dhaka" ? "(Dhaka)" : order.deliveryArea === "outside_dhaka" ? "(Outside Dhaka)" : ""}</span>
                    {order.shippingCost > 0 ? (
                      <span>{formatBDT(order.shippingCost)}</span>
                    ) : (
                      <span className="text-foreground font-medium">Free</span>
                    )}
                  </div>
                )}
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatBDT(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Shipping Address</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Payment</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{order.paymentMethod}</p>
                <p className="mt-1 capitalize">Status: {order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
