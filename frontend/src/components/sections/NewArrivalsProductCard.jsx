"use client";

import Link from 'next/link';
import { useState } from "react";

import { motion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/services/product.api";
import { formatBDT } from "@/utils/currency";
import OrderModal from "@/components/ui/OrderModal";
import { useAuth } from "@/hooks/useAuth";

export default function NewArrivalsProductCard({ product, index }) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;
  const isOutOfStock = product.stock === 0;

  const handlePrefetch = () => {
    if (product?._id) {
      queryClient.prefetchQuery({
        queryKey: ["product", String(product._id)],
        queryFn: () => getProductById(product._id),
        staleTime: 10 * 60 * 1000,
      });
    }
  };

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }),
        }}
        className="shrink-0 w-37.5 sm:w-45"
      >
        <div className="group flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-card">
          <Link
            href={`/product/${product._id}`}
            className="block"
            onMouseEnter={handlePrefetch}
            onTouchStart={handlePrefetch}
          >
            {/* Section 1: Fixed Consistent Image Section */}
            <div className="relative aspect-[4/5] h-48 sm:h-54 w-full shrink-0 overflow-hidden bg-muted/30 flex items-center justify-center border-b border-border/40" suppressHydrationWarning>
              <img
                src={product.thumbnail || product.images?.[0] || null}
                alt={product.title}
                className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {hasDiscount && (
                <div className="absolute left-0 top-2.5 z-10 rounded-r bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-sm">
                  -{Math.round(product.discountPercentage)}%
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <span className="rounded bg-foreground px-2 py-1 text-[10px] font-semibold text-background">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="flex flex-1 flex-col justify-between p-2">
            <h4 className="line-clamp-1 text-xs font-medium text-foreground leading-tight">
              {product.title}
            </h4>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {formatBDT(hasDiscount ? discountedPrice : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                  {formatBDT(product.price)}
                </span>
              )}
            </div>
          </div>

          {!isAdmin && (
            <div className="p-2 pt-0 flex gap-1.5 items-center">
              <button
                disabled={isOutOfStock}
                onClick={() => setShowModal(true)}
                title="Add to Cart"
                className="shrink-0 size-8 sm:size-9 flex items-center justify-center rounded border border-primary text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <ShoppingCart className="size-3.5 shrink-0" />
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => setShowModal(true)}
                title="Order Now"
                className="flex-1 h-8 sm:h-9 flex items-center justify-center rounded bg-primary px-2 text-[11px] font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <span className="whitespace-nowrap">{isOutOfStock ? "Unavailable" : "অর্ডার করুন"}</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {!isAdmin && (
        <OrderModal
          product={product}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
