"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getRecentSales } from "@/services/order.api";

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

export default function RecentSalesToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: sales, isLoading } = useQuery({
    queryKey: ["recent-sales-toast"],
    queryFn: getRecentSales,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!sales || sales.length === 0 || dismissed) {
      setIsVisible(false);
      return;
    }

    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [sales, dismissed]);

  useEffect(() => {
    if (!sales || sales.length === 0 || dismissed) return;

    let hideTimer;
    let nextTimer;

    if (isVisible) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    } else {
      nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sales.length);
        setIsVisible(true);
      }, 20000);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, sales, dismissed]);

  if (dismissed || !sales || sales.length === 0 || isLoading) {
    return null;
  }

  const currentSale = sales[currentIndex];
  if (!currentSale) return null;

  return (
    <div className="fixed bottom-20 left-3 sm:left-4 lg:bottom-4 lg:left-4 z-[90] pointer-events-none max-w-[calc(100vw-1.5rem)] sm:max-w-md">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto relative flex items-center gap-3.5 rounded-2xl border border-border bg-card/95 p-3.5 pr-9 shadow-xl backdrop-blur-md text-card-foreground"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setDismissed(true);
              }}
              className="absolute right-2.5 top-2.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>

            {/* Thumbnail */}
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted/60 border border-border">
              {currentSale.productImage ? (
                <img
                  src={currentSale.productImage}
                  alt={currentSale.productTitle}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ShoppingBag className="size-6" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-semibold text-foreground truncate">
                <span className="text-primary font-bold">{currentSale.buyerName}</span> has purchased!
              </p>
              <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                {currentSale.productTitle}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-muted-foreground/80 font-normal">
                  {formatTimeAgo(currentSale.createdAt)}
                </span>
                <Link
                  href={currentSale.productId ? `/product/${currentSale.productId}` : "/products"}
                  className="font-semibold text-primary underline hover:text-primary/80 transition-colors"
                >
                  View Product
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
