"use client";

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  Copy,
  Check,
  Truck,
  CircleCheck,
  Clock,
  XCircle,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { trackOrder } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const STATUS_CONFIG = {
  pending: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "bg-muted text-foreground border-border",
    icon: Check,
    label: "Confirmed",
  },
  processing: {
    color: "bg-muted text-foreground border-border",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "bg-muted text-foreground border-border",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    icon: CircleCheck,
    label: "Delivered",
  },
  cancelled: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
    label: "Cancelled",
  },
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProgressTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2">
        <XCircle className="size-4 text-destructive" />
        <span className="text-xs font-semibold text-destructive">
          This order has been cancelled
        </span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="flex items-center justify-between overflow-x-auto min-w-[320px] sm:min-w-0 pb-1">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300 sm:size-9 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : ""}`}
              >
                {i < activeIdx ? (
                  <Check className="size-4" />
                ) : (
                  <span className="text-[11px] font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-medium capitalize sm:text-xs ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 sm:mx-2 ${
                  i < activeIdx ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetails({ children }) {
  const { siteName } = useSettings();
  const { id } = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Order ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => trackOrder({ orderId: id?.toLowerCase() }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`Order Details | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!order || order?.notFound) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`Order Details | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl py-20 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Package className="size-7 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Order not found
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We couldn't find this order.
          </p>
          <Button
            className="mt-6 rounded-xl"
            onClick={() => router.push("/orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`Order #${order._id?.slice(-8).toUpperCase()} | ${siteName}`}</title>
      </Helmet>
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Orders
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5">
            <div className="border-b border-border bg-linear-to-r from-muted/40 to-muted/20 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="size-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="text-border">|</span>
                      <span className="flex items-center gap-1">
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${config.color}`}
                  >
                    <StatusIcon className="size-3" />
                    {config.label}
                  </span>
                </div>
              </div>
            </div>

            {/* ID + Progress */}
            <div className="px-5 py-4 sm:px-6">
              <button
                onClick={copyOrderId}
                className="mb-5 flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copied ? "Copied!" : `ID: ${order._id}`}
              </button>

              <div className="pb-2">
                <ProgressTracker status={order.orderStatus} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5">
                <div className="border-b border-border bg-linear-to-r from-muted/40 to-muted/20 px-5 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">
                      Items ({order.totalItems})
                    </h2>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.productId}
                        className="group flex gap-4 rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40 sm:p-4"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={item.colorImage || item.thumbnail}
                            alt={item.title}
                            className="size-16 rounded-xl object-cover ring-1 ring-border transition-transform group-hover:scale-105 sm:size-20"
                          />
                          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${item.productId}`}
                            className="text-sm font-semibold text-foreground hover:underline"
                          >
                            {item.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{item.quantity} x {formatBDT(item.price)}</span>
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
                        <span className="shrink-0 text-sm font-bold text-foreground">
                          {formatBDT(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-5 lg:col-span-1">
              {/* Order Total */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Order Total
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBDT(order.subtotal ?? order.totalPrice)}</span>
                  </div>
                  {order.shippingCost != null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Shipping{" "}
                        {order.deliveryArea === "inside_dhaka"
                          ? "(Dhaka)"
                          : order.deliveryArea === "outside_dhaka"
                          ? "(Outside Dhaka)"
                          : ""}
                      </span>
                      {order.shippingCost > 0 ? (
                        <span>{formatBDT(order.shippingCost)}</span>
                      ) : (
                        <span className="font-medium text-foreground">
                          Free
                        </span>
                      )}
                    </div>
                  )}
                  <div className="border-t border-border pt-2.5">
                    <div className="flex justify-between text-base font-bold text-foreground">
                      <span>Total</span>
                      <span>{formatBDT(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Shipping Address
                </h2>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p>{order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.address}</p>
                  {order.shippingAddress?.city && (
                    <p>{order.shippingAddress.city}</p>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Payment
                </h2>
                <p className="text-sm text-muted-foreground">
                  {order.paymentMethod}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      order.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
