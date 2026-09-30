"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useMemo, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/sections/ProductCard";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
];

import usePageTitle from "@/hooks/usePageTitle";

export default function Products({ initialCategories, initialProducts }) {
  const { siteName } = useSettings();
  usePageTitle("All Products");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const updateCategory = (slug) => {
    const next = new URLSearchParams(searchParams.toString());
    if (slug) next.set("category", slug);
    else next.delete("category");
    router.push(pathname + "?" + next.toString());
  };

  const applySearch = (q) => {
    const next = new URLSearchParams(searchParams.toString());
    if (q) next.set("search", q);
    else next.delete("search");
    router.push(pathname + "?" + next.toString());
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    initialData: initialCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sort]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", { search: searchQuery, category: selectedCategory, sort, page, limit }],
    queryFn: () => getProducts({ search: searchQuery, category: selectedCategory, sort, page, limit }),
    placeholderData: keepPreviousData,
    initialData: (!searchQuery && !selectedCategory && sort === "newest" && page === 1 && initialProducts?.products?.length > 0) ? initialProducts : undefined,
    staleTime: 10 * 60 * 1000,
  });

  const filteredProducts = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalProductsCount = data?.totalProducts ?? 0;
  const showSkeleton = (isLoading || isFetching) && filteredProducts.length === 0;

  const handleCategoryChange = (slug) => {
    updateCategory(slug === selectedCategory ? "" : slug);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSort("newest");
  };

  const hasFilters = selectedCategory || searchQuery;

  const activeCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    for (const parent of categories) {
      if (parent.slug === selectedCategory) return parent.name;
      for (const child of parent.children ?? []) {
        if (
          child.slug === selectedCategory ||
          child.categories?.includes(selectedCategory)
        ) {
          return child.name;
        }
      }
    }
    return selectedCategory;
  }, [selectedCategory, categories]);

  return (
    <div className="flex h-full flex-col bg-background">
      <Helmet><title>{`Products | ${siteName}`}</title></Helmet>
      <div className="shrink-0 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              All Products
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalProductsCount} products found
              {activeCategoryLabel && (
                <> in <span className="font-medium text-foreground">{activeCategoryLabel}</span></>
              )}
              {searchQuery && (
                <> for &ldquo;<span className="font-medium text-foreground">{searchQuery}</span>&rdquo;</>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6 lg:h-0 lg:flex-1 lg:overflow-y-auto lg:px-8">
        <div className="mx-auto max-w-7xl lg:flex lg:gap-8">

          {showFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background p-4 transition-transform duration-200 lg:static lg:translate-x-0 lg:w-56 lg:border-0 lg:p-0 lg:py-1 lg:overflow-visible ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="space-y-6 py-1 overflow-visible">
              <div className="flex items-center justify-between lg:hidden">
                <span className="text-sm font-semibold text-foreground">Filters</span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  key={searchQuery}
                  placeholder="Search products..."
                  defaultValue={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applySearch(e.target.value);
                    }
                  }}
                  className="pl-9"
                />
              </div>

              <div className="overflow-visible">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Categories
                </h3>
                <div className="space-y-0.5 overflow-visible">
                  {categories.map((parent, parentIdx) => {
                    const isActive =
                      selectedCategory === parent.slug ||
                      parent.children?.some(
                        (c) =>
                          c.slug === selectedCategory ||
                          c.categories?.includes(selectedCategory)
                      );

                    return (
                      <div key={`${parent.slug}-${parentIdx}`} className="relative group/parent">
                        <button
                          onClick={() => {
                            handleCategoryChange(selectedCategory === parent.slug ? "" : parent.slug);
                            if (!parent.children?.length) setShowFilters(false);
                          }}className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {parent.name}
                          {parent.children?.length > 0 && (
                            <svg
                              className={`size-3.5 transition-transform lg:group-hover/parent:rotate-90 ${isActive ? "rotate-90 lg:rotate-0 text-primary-foreground" : "rotate-90 lg:rotate-0 text-muted-foreground"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>

                        {parent.children?.length > 0 && (
                          <div className="invisible absolute left-0 top-full z-20 mt-0.5 w-full rounded-xl border border-border bg-card py-1.5 shadow-lg transition-all duration-150 group-hover/parent:visible group-hover/parent:opacity-100">
                            {parent.children.map((child, childIdx) => {
                              const childActive =
                                selectedCategory === child.slug ||
                                child.categories?.includes(selectedCategory);

                              return (
                                <button
                                  key={`${child.slug}-${childIdx}`}
                                  onClick={() => {
                                    handleCategoryChange(child.slug);
                                    setShowFilters(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm transition-colors ${
                                    childActive
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  <span className="size-1 rounded-full bg-current opacity-40" />
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {parent.children?.length > 0 && isActive && (
                          <div className="pl-4 lg:hidden">
                            {parent.children.map((child, childIdx) => {
                              const childActive =
                                selectedCategory === child.slug ||
                                child.categories?.includes(selectedCategory);

                              return (
                                <button
                                  key={`${child.slug}-${childIdx}`}
                                  onClick={() => {
                                    handleCategoryChange(child.slug);
                                    setShowFilters(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                                    childActive
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  <span className="size-1 rounded-full bg-current opacity-40" />
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                >
                  <X className="size-4" data-icon="inline-start" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:flex-1">
            <div className="shrink-0 py-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {activeCategoryLabel}
                      <button
                        onClick={() => handleCategoryChange(selectedCategory)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="size-4" />
                    Filters
                  </Button>
                  <SlidersHorizontal className="size-4 text-muted-foreground hidden lg:block" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              {showSkeleton ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm text-muted-foreground">No products found.</p>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
              )}

              {!showSkeleton && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="size-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
