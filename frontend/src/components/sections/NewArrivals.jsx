"use client";

import Link from 'next/link';
import { useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getNewArrivals } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import NewArrivalsProductCard from "./NewArrivalsProductCard";

function NewArrivalsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 w-40 sm:w-45">
          <Skeleton className="aspect-3/4 w-full rounded-lg" />
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewArrivals({ initialData }) {
  const scrollRef = useRef(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: getNewArrivals,
    initialData: (initialData?.products?.length > 0) ? initialData : undefined,
    staleTime: 10 * 60 * 1000,
  });

  const products = data?.products ?? [];
  const showSkeleton = (isLoading || isFetching) && products.length === 0;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="new-arrivals" className="bg-background py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center justify-between sm:mb-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll("left")}
              className="hidden sm:flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              NEW ARRIVALS
            </h2>
            <button
              onClick={() => scroll("right")}
              className="hidden sm:flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <Link
            href="/products"
            className="rounded-lg border-2 border-foreground px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground hover:text-background sm:text-sm"
          >
            SHOP MORE
          </Link>
        </motion.div>

        {showSkeleton ? (
          <NewArrivalsSkeleton />
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:gap-3 [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0"
          >
            {products.map((product, i) => (
              <NewArrivalsProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
