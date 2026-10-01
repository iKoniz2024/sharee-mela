"use client";

import Link from 'next/link';
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
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
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{stock} left</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500"
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
          hidden: { opacity: 0, y: 16 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }),
        }}
        className="h-full"
      >
        <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          {/* Section 1: Compact Image Section (Aspect Square) */}
          <Link
            href={`/product/${product._id}`}
            className="relative block aspect-square w-full shrink-0 overflow-hidden bg-muted/30 border-b border-border/40"
            onMouseEnter={handlePrefetch}
            onTouchStart={handlePrefetch}
            suppressHydrationWarning
          >
            <img
              src={product.thumbnail || product.images?.[0] || undefined}
              alt={product.title}
              className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {hasDiscount && (
              <div className="absolute left-0 top-2 z-10 rounded-r bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-xs animate-pulse">
                -{Math.round(product.discountPercentage)}% OFF
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute right-2 top-2 z-10">
                <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0.5">
                  Only {product.stock} left
                </Badge>
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-xs">
                <Badge variant="destructive" className="text-[11px] font-semibold">
                  Out of Stock
                </Badge>
              </div>
            )}
          </Link>

          {/* Section 2: Compact Content Section */}
          <div className="flex flex-1 flex-col justify-between p-2 sm:p-2.5">
            <Link
              href={`/product/${product._id}`}
              className="group/title block space-y-1"
              onMouseEnter={handlePrefetch}
              onTouchStart={handlePrefetch}
            >
              <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-foreground leading-snug transition-colors group-hover/title:text-primary">
                {product.title}
              </h3>

              <div className="flex items-baseline justify-between gap-1 pt-0.5">
                <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {formatBDT(hasDiscount ? discountedPrice : product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through font-normal">
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
                <div className="hidden sm:block pt-0.5">
                  <StockBar stock={product.stock} maxStock={maxStock} />
                </div>
              )}
            </Link>

            {/* Section 3: Sleek Action Buttons (Add to Cart is smaller than Order button) */}
            {!isAdmin && (
              <div className="pt-2 flex gap-1.5 items-center mt-auto">
                <button
                  disabled={product.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                  }}
                  title="Add to Cart"
                  className="shrink-0 h-8 px-2 flex items-center justify-center gap-1 rounded border border-primary text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  <ShoppingCart className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline text-[11px] sm:text-xs font-medium whitespace-nowrap">Add to Cart</span>
                </button>

                <button
                  disabled={product.stock === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                  }}
                  title="Order Now"
                  className="flex-1 h-8 flex items-center justify-center rounded bg-primary px-2 text-[11px] sm:text-xs font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <span className="whitespace-nowrap">{product.stock === 0 ? "Unavailable" : "অর্ডার করুন"}</span>
                </button>
              </div>
            )}
          </div>
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
