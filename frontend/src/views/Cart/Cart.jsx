"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, AlertTriangle } from "lucide-react";
import useCart from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getLocalCart, updateLocalCartItem, removeFromLocalCart, getLocalCartCount } from "@/utils/localCart";

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
          <Skeleton className="size-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getItemStatus(item) {
  const qty = item.quantity ?? 1;
  const stock = item.stock;
  if (stock === undefined || stock === null) {
    return { ok: true, message: "" };
  }
  if (stock === 0 || qty > stock) {
    return { ok: false, message: stock === 0 ? "Out of stock" : `Only ${stock} available` };
  }
  return { ok: true, message: "" };
}

import usePageTitle from "@/hooks/usePageTitle";

export default function Cart({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Shopping Cart");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchCartCount } = useCart();

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

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity, size, color }) => {
      updateLocalCartItem(id, quantity, size, color);
      return Promise.resolve();
    },
    onMutate: async ({ id, quantity, size, color }) => {
      await queryClient.cancelQueries({ queryKey: ["localCart"] });
      const previousCart = queryClient.getQueryData(["localCart"]);
      queryClient.setQueryData(["localCart"], (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.productId === id &&
              (item.size || "") === (size || "") &&
              (item.color || "") === (color || "")
              ? { ...item, quantity }
              : item
          ),
        };
      });
      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["localCart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["localCart"] });
      refetchCartCount(getLocalCartCount());
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, size, color }) => {
      removeFromLocalCart(id, size, color);
      return Promise.resolve();
    },
    onMutate: async ({ id, size, color }) => {
      await queryClient.cancelQueries({ queryKey: ["localCart"] });
      const previousCart = queryClient.getQueryData(["localCart"]);
      queryClient.setQueryData(["localCart"], (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter(
            (item) =>
              !(
                item.productId === id &&
                (item.size || "") === (size || "") &&
                (item.color || "") === (color || "")
              )
          ),
        };
      });
      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["localCart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["localCart"] });
      refetchCartCount(getLocalCartCount());
    },
  });

  const totalItems = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0);
  const FREE_SHIPPING_THRESHOLD = 1000;
  const SHIPPING_INSIDE_DHAKA = 60;
  const SHIPPING_OUTSIDE_DHAKA = 120;

  const itemStatuses = items.map((item) => ({ item, ...getItemStatus(item) }));
  const hasStockIssues = itemStatuses.some((s) => !s.ok);
  const stockIssueCount = itemStatuses.filter((s) => !s.ok).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet><title>{`Cart | ${siteName}`}</title></Helmet>
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Cart</h1>
          <CartSkeleton />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet><title>{`Cart | ${siteName}`}</title></Helmet>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center gap-4 py-20">
            <ShoppingBag className="size-16 text-muted-foreground/30" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Your cart is empty</h1>
            <p className="text-sm text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="mt-4 rounded-lg">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Helmet><title>{`Cart | ${siteName}`}</title></Helmet>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
          </h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/products")} className="self-start">
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Continue Shopping
          </Button>
        </div>

        {hasStockIssues && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
            <AlertTriangle className="size-5 shrink-0" />
            <p>
              {stockIssueCount} item{stockIssueCount > 1 ? "s have" : " has"} stock issues. Please adjust quantities before checkout.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {itemStatuses.map(({ item, ok, message }, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-3 rounded-xl border bg-card p-3 shadow-sm sm:gap-4 sm:p-4 ${!ok ? "border-muted-foreground" : "border-border"
                  }`}
              >
                <Link
                  href={`/product/${item.productId}`}
                  className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24"
                >
                  {item.colorImage || item.thumbnail ? (
                    <img
                      src={item.colorImage || item.thumbnail}
                      alt={item.title || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                      <ShoppingBag className="size-8" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {item.title || "Product"}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{item.category || ""}</span>
                      {item.color && (
                        <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                          Color: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                  </div>

                  {!ok && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="size-3 shrink-0" />
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.productId,
                            quantity: item.quantity - 1,
                            size: item.size || "",
                            color: item.color || "",
                          })
                        }
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.productId,
                            quantity: item.quantity + 1,
                            size: item.size || "",
                            color: item.color || "",
                          })
                        }
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-sm font-bold text-foreground">
                        {item.price ? formatBDT(item.price * item.quantity) : "N/A"}
                      </span>
                      <button
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate({ id: item.productId, size: item.size || "", color: item.color || "" })}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:sticky sm:top-24 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="shrink-0">{formatBDT(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-foreground font-medium">Free</span>
                  ) : (
                    <span className="shrink-0">{formatBDT(SHIPPING_INSIDE_DHAKA)} - {formatBDT(SHIPPING_OUTSIDE_DHAKA)}</span>
                  )}
                </div>
                {totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatBDT(FREE_SHIPPING_THRESHOLD - totalPrice)} more for free shipping. Final cost depends on your location.
                  </p>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="shrink-0">{formatBDT(totalPrice)} + shipping</span>
                  </div>
                </div>
              </div>
              <Button
                className="mt-6 w-full rounded-lg"
                size="lg"
                disabled={hasStockIssues}
                onClick={() => router.push("/checkout")}
              >
                {hasStockIssues ? "Fix Stock Issues" : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
