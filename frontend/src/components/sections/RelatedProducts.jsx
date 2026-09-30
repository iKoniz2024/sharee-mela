"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Trophy, Sparkles, Star, Flame } from "lucide-react";
import { getProducts, getBestSellingProducts, getNewArrivals, getProductById } from "@/services/product.api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/utils/currency";
import OrderModal from "@/components/ui/OrderModal";
import { useAuth } from "@/hooks/useAuth";

function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-square w-full p-2">
            <Skeleton className="h-full w-full rounded-lg" />
            <Skeleton className="absolute bottom-2 left-1/2 h-6 w-20 -translate-x-1/2 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-none" />
        </div>
      ))}
    </div>
  );
}

const badgeConfig = {
  "best-seller": {
    label: "Best Seller",
    icon: Trophy,
    className: "bg-foreground text-background",
  },
  "new-arrival": {
    label: "New Arrival",
    icon: Sparkles,
    className: "bg-foreground text-background",
  },
  "top-rated": {
    label: "Top Rated",
    icon: Star,
    className: "bg-foreground text-background",
  },
  popular: {
    label: "Popular",
    icon: Flame,
    className: "bg-foreground text-background",
  },
};

function CompactProductCard({ product, index }) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;
  const isOutOfStock = product.stock === 0;
  const activeBadgeKey = product.badge;
  const activeBadgeInfo = activeBadgeKey ? badgeConfig[activeBadgeKey] : null;

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
            transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }),
        }}
      >
        <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          {/* Section 1: Fixed Consistent Image Section */}
          <Link
            href={`/product/${product._id}`}
            className="relative block aspect-square h-40 sm:h-44 w-full shrink-0 overflow-hidden bg-muted/30 border-b border-border/40 flex items-center justify-center"
            onMouseEnter={handlePrefetch}
            onTouchStart={handlePrefetch}
          >
            {/* Badges */}
            {activeBadgeInfo && (
              <div className="absolute left-2 top-2 z-10">
                <Badge className={`text-[10px] font-semibold px-2 py-0.5 shadow-md flex items-center gap-1 ${activeBadgeInfo.className}`}>
                  {(() => {
                    const Icon = activeBadgeInfo.icon;
                    return <Icon className="size-3" />;
                  })()}
                  <span>{activeBadgeInfo.label}</span>
                </Badge>
              </div>
            )}

            {hasDiscount && (
              <div className="absolute left-0 top-3 z-10 rounded-r bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </div>
            )}

            <img
              src={product.thumbnail || product.images?.[0] || undefined}
              alt={product.title}
              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Price Pill Overlay */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-1.5 rounded-lg bg-background/95 px-2.5 py-1 shadow-sm border border-border/60 backdrop-blur-md whitespace-nowrap">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {formatBDT(hasDiscount ? discountedPrice : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through font-normal">
                  {formatBDT(product.price)}
                </span>
              )}
            </div>

            {isOutOfStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                  Stock Out
                </span>
              </div>
            )}
          </Link>

          {/* Bottom Order Button */}
          {!isAdmin && (
            <button
              disabled={isOutOfStock}
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-foreground py-2 text-xs sm:text-sm font-bold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              <ShoppingCart className="size-3.5" />
              <span>{isOutOfStock ? "Unavailable" : "অর্ডার করুন"}</span>
            </button>
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

export default function RelatedProducts({ currentProduct }) {
  const category = currentProduct?.category;
  const currentId = currentProduct?._id;

  const { data: relatedProducts = [], isLoading } = useQuery({
    queryKey: ["related-products", category, currentId],
    queryFn: async () => {
      let result = [];

      if (category) {
        // Fetch products in the same category
        const response = await getProducts({ category, limit: 12 });
        const prods = response?.products || (Array.isArray(response) ? response : []);
        result = prods.filter((p) => p._id !== currentId);
      }

      // ONLY if there are ZERO products in the same category, fallback to mixed New Arrivals & Best Selling
      if (result.length === 0) {
        try {
          const [newRes, bestRes] = await Promise.all([
            getNewArrivals().catch(() => ({})),
            getBestSellingProducts().catch(() => ({})),
          ]);

          const newProds = (newRes?.products || (Array.isArray(newRes) ? newRes : []))
            .filter((p) => p._id !== currentId)
            .map((p) => ({ ...p, badge: p.badge || "new-arrival" }));

          const bestProds = (bestRes?.products || (Array.isArray(bestRes) ? bestRes : []))
            .filter((p) => p._id !== currentId)
            .map((p) => ({ ...p, badge: p.badge || "best-seller" }));

          // Interleave New Arrivals and Best Selling products
          const mixed = [];
          const seenIds = new Set([currentId]);
          const maxLength = Math.max(newProds.length, bestProds.length);

          for (let i = 0; i < maxLength; i++) {
            if (i < newProds.length && !seenIds.has(newProds[i]._id)) {
              seenIds.add(newProds[i]._id);
              mixed.push(newProds[i]);
            }
            if (i < bestProds.length && !seenIds.has(bestProds[i]._id)) {
              seenIds.add(bestProds[i]._id);
              mixed.push(bestProds[i]);
            }
          }

          result = mixed;
        } catch (e) {
          console.error("Fallback mixed products fetch error:", e);
        }
      }

      return result.slice(0, 12);
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!currentProduct,
  });

  if (!isLoading && relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-14 border-t border-border/80 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center sm:mb-8"
      >
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Related Products
        </h2>
      </motion.div>

      {isLoading ? (
        <RelatedProductsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {relatedProducts.map((product, i) => (
            <CompactProductCard
              key={product._id}
              product={product}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
