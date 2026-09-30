"use client";

import { useRouter } from 'next/navigation';
import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Package,
  ArrowLeft,
  MapPin,
  Calendar,
  ShoppingBag,
  Copy,
  Check,
  Truck,
  CircleCheck,
  Clock,
  XCircle,
  CreditCard,
  User,
  Phone as PhoneIcon,
  Home,
  MapPinned,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { trackOrder } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatBDT } from "@/utils/currency";

const STATUS_CONFIG = {
  pending: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "bg-muted text-foreground border-border",
    dot: "bg-foreground",
    icon: Check,
    label: "Confirmed",
  },
  processing: {
    color: "bg-muted text-foreground border-border",
    dot: "bg-foreground",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "bg-muted text-foreground border-border",
    dot: "bg-foreground",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
    icon: CircleCheck,
    label: "Delivered",
  },
  cancelled: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
    icon: XCircle,
    label: "Cancelled",
  },
};

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProgressTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5">
        <XCircle className="size-3.5 text-destructive" />
        <span className="text-[11px] font-semibold text-destructive">
          Cancelled
        </span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isActive = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={`relative z-10 flex size-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : ""}`}
              >
                {i < activeIdx ? (
                  <Check className="size-3" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              <span className={`absolute -bottom-5 whitespace-nowrap text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-0.5 h-0.5 w-6 sm:w-10 ${
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

function OrderCard({ order, copied, onCopy }) {
  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5"
    >
      {/* Header */}
      <div className="border-b border-border bg-linear-to-r from-muted/40 to-muted/20 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => onCopy(order._id)}
                className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>{copied ? "Copied!" : "Copy full ID"}</span>
              </button>
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

        {/* Progress */}
        <div className="mt-5 pb-6">
          <ProgressTracker status={order.orderStatus} />
        </div>
      </div>

      {/* Items */}
      <div className="p-5 sm:p-6">
        <div className="mb-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Items
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {order.items?.slice(0, 6).map((item) => (
              <div key={item.productId} className="group relative shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="size-16 rounded-xl object-cover ring-1 ring-border transition-transform group-hover:scale-105 sm:size-18"
                />
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {item.quantity}
                </span>
              </div>
            ))}
            {order.items?.length > 6 && (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                +{order.items.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Order Meta */}
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(order.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="size-3.5" />
            {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
          </span>
          {order.shippingAddress?.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {order.shippingAddress.city}
            </span>
          )}
        </div>

        {/* Total */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-xl font-bold text-foreground">
            {formatBDT(order.totalPrice)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                <MapPinned className="size-3.5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Shipping Address
              </p>
            </div>
            <div className="space-y-1 pl-8">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="size-3" />
                {order.shippingAddress?.fullName}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PhoneIcon className="size-3" />
                {order.shippingAddress?.phone}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Home className="size-3" />
                {order.shippingAddress?.address}
              </p>
              {order.shippingAddress?.city && (
                <p className="text-xs text-muted-foreground">
                  {order.shippingAddress.city}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                <CreditCard className="size-3.5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">Payment</p>
            </div>
            <div className="space-y-1.5 pl-8">
              <p className="text-xs text-muted-foreground">
                {order.paymentMethod}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
                    order.paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.shippingCost !== undefined && (
                <div className="mt-2 space-y-1 border-t border-border pt-2">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBDT(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Shipping</span>
                    <span>{order.shippingCost > 0 ? formatBDT(order.shippingCost) : "Free"}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 text-xs font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatBDT(order.totalPrice)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import usePageTitle from "@/hooks/usePageTitle";

export default function MyOrders() {
  const { siteName } = useSettings();
  usePageTitle("Track Order");
  const router = useRouter();
  const [trackValue, setTrackValue] = useState("");
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const trackMutation = useMutation({
    mutationFn: trackOrder,
    onSuccess: (data) => {
      if (data?.notFound) {
        setOrder(null);
        setNotFound(true);
        toast.error(data?.message || "Order not found");
        return;
      }
      setOrder(data);
      setNotFound(false);
    },
    onError: (err) => {
      setOrder(null);
      setNotFound(true);
      toast.error(err?.response?.data?.message || "Order not found");
    },
  });

  const handleTrack = (e) => {
    e.preventDefault();
    const val = trackValue.trim();
    if (!val) {
      toast.error("Please enter a Phone Number or Invoice Number");
      return;
    }
    const clean = val.replace(/^#/, "").toLowerCase();
    const isPhone = /^[+]?[0-9]{7,15}$/.test(clean.replace(/\s|-/g, ""));
    if (isPhone) {
      trackMutation.mutate({ phone: clean });
    } else {
      trackMutation.mutate({ orderId: clean });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`Track Order | ${siteName}`}</title>
      </Helmet>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Home
        </Button>

        {/* Instructions */}
        <div className="rounded border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            অর্ডার ট্র্যাককরুন
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              ১। পণ্যর ডেলিভারী আপডেট পেতে আপনার Mobile Number নাম্বার দিয়ে অর্ডার
              ট্র্যাককরুন।
            </p>
            <p>
              ২। আপনার অর্ডার করা পণ্যর ডেলিভারীর বর্তমান অবস্থা জানতে নিমের
              &quot;ট্র্যাক বক্স&quot; এ Mobile নাম্বার টি প্রদানকরুন এবং
              &quot;ট্র্যাক অর্ডার&quot; বাটনে ক্লিক করুন।
            </p>
          </div>
        </div>

        {/* Track Form */}
        <form
          onSubmit={handleTrack}
          className="rounded-xl border border-border bg-card p-3.5 sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={trackValue}
              onChange={(e) => setTrackValue(e.target.value)}
              placeholder="Enter Phone or Invoice Number"
              className="h-10 sm:h-11 flex-1 text-sm"
            />
            <Button
              type="submit"
              className="h-10 sm:h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto shrink-0 flex items-center justify-center"
              disabled={trackMutation.isPending}
            >
              {trackMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Tracking...
                </span>
              ) : (
                "Track Order"
              )}
            </Button>
          </div>
        </form>

        {/* Not Found */}
        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded border border-border bg-card p-12 text-center"
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Package className="size-7 text-muted-foreground/40" />
              </div>
              <p className="text-base font-semibold text-foreground">
                অর্ডার খুঁজে পাওয়া যায়নি
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                আমরা সেই আইডি দিয়ে কোনো অর্ডার খুঁজে পাইনি।
                <br />
                অনুগ্রহ করে আবার চেক করে চেষ্টা করুন।
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Result */}
        <AnimatePresence mode="wait">
          {order && (
            <OrderCard
              key={order._id}
              order={order}
              copied={copied}
              onCopy={copyOrderId}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
