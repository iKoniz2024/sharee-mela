"use client";

import Link from 'next/link';
import { useState } from "react";

import { motion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/services/product.api";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/utils/currency";
import OrderModal from "@/components/ui/OrderModal";
import { useAuth } from "@/hooks/useAuth";

function StockBar({ stock, maxStock }) {
  const percentage = maxStock > 0 ? Math.min((stock / maxStock) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {stock} left
        </span>
        <span className="text-[11px] text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500 bg-secondary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function FlashSaleProductCard({ product, index, maxStock }) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

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
            transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }),
        }}
      >
        <Link
          href={`/product/${product._id}`}
          className="group block h-full"
          onMouseEnter={handlePrefetch}
          onTouchStart={handlePrefetch}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* Section 1: Fixed Consistent Image Section */}
            <div className="relative aspect-[4/5] h-48 sm:h-54 w-full shrink-0 overflow-hidden bg-muted/30 flex items-center justify-center border-b border-border/40" suppressHydrationWarning>
              <img
                src={product.thumbnail || product.images?.[0] || undefined}
                alt={product.title}
                className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {hasDiscount && (
                <div className="absolute left-0 top-2.5 z-10 rounded-r bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-sm animate-pulse">
                  -{Math.round(product.discountPercentage)}% OFF
                </div>
              )}

              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute right-2 top-2.5 z-10">
                  <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                    Only {product.stock} left
                  </Badge>
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Badge variant="destructive" className="text-xs font-semibold">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Section 2: Compact Product Information Section */}
            <div className="flex flex-1 flex-col justify-between p-2">
              <div>
                <h3 className="line-clamp-1 text-xs font-medium text-foreground leading-tight">
                  {product.title}
                </h3>
              </div>

              <div className="mt-0.5 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex flex-col leading-none min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {formatBDT(hasDiscount ? discountedPrice : product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-muted-foreground line-through mt-0.5">
                        {formatBDT(product.price)}
                      </span>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground shrink-0">
                      {product.stock} in stock
                    </span>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="hidden sm:block">
                    <StockBar stock={product.stock} maxStock={maxStock} />
                  </div>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="p-2 pt-0 flex gap-1.5 items-center">
                <button
                  disabled={product.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                  }}
                  title="Add to Cart"
                  className="shrink-0 size-8 sm:size-9 flex items-center justify-center rounded border border-primary text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  <ShoppingCart className="size-3.5 shrink-0" />
                </button>

                <button
                  disabled={product.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                  }}
                  title="Order Now"
                  className="flex-1 h-8 sm:h-9 flex items-center justify-center rounded bg-primary px-2 text-[11px] font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <span className="whitespace-nowrap">{product.stock === 0 ? "Unavailable" : "অর্ডার করুন"}</span>
                </button>
              </div>
            )}
          </div>
        </Link>
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
