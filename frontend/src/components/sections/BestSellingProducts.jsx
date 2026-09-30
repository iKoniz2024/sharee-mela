"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getBestSellingProducts } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";

function BestSellingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";

export default function BestSellingProducts({ initialData }) {
  const { siteName } = useSettings();
  usePageTitle("Best Selling Products");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["best-selling-products"],
    queryFn: getBestSellingProducts,
    initialData: (initialData?.products?.length > 0) ? initialData : undefined,
    staleTime: 10 * 60 * 1000,
  });

  const bestSellingProducts = data?.products ?? [];
  const showSkeleton = (isLoading || isFetching) && bestSellingProducts.length === 0;

  return (
    <section id="best-selling" className="bg-background pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Helmet>
        <title>{siteName ? `Best Selling Products | ${siteName}` : "Best Selling Products | Sharee Mela"}</title>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Best Selling Products
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Our most popular products loved by customers.
          </p>
        </motion.div>

        {showSkeleton ? (
          <BestSellingSkeleton />
        ) : bestSellingProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellingProducts.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                index={i}
                badge={null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
