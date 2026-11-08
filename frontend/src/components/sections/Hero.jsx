"use client";

import { useState } from "react";
import Link from 'next/link';

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, Menu, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBanners } from "@/services/banner.api";
import { getCategories } from "@/services/category.api";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const heroStyles = `
  .hero-swiper .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.4);
    opacity: 1;
    transition: all 0.3s;
  }
  .hero-swiper .swiper-pagination-bullet-active {
    background: #fff;
    width: 24px;
    border-radius: 5px;
  }
  .sleek-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .sleek-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .sleek-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(150, 150, 150, 0.35);
    border-radius: 9999px;
  }
  .sleek-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(150, 150, 150, 0.6);
  }
  .sleek-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(150, 150, 150, 0.35) transparent;
  }
`;

export default function Hero({ initialData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
    initialData,
    staleTime: 10 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categoryList = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : [];

  const banners = (data ?? []).filter((b) => b.isActive !== false && (b.image || b.images?.length > 0));

  if (isLoading && banners.length === 0) {
    return (
      <section id="hero" className="relative overflow-hidden py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-80 items-center justify-center sm:h-100 lg:h-125">
            <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section id="hero" className="relative py-3 sm:py-5">
      <style>{heroStyles}</style>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          {/* Left Column: Category Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="rounded-xl border border-border bg-card shadow-xs flex flex-col overflow-hidden max-h-[350px] xl:max-h-[390px]">
              {/* Header */}
              <div className="bg-[#f1f3f5] dark:bg-muted/70 px-4 py-3 border-b border-border/80 rounded-t-xl shrink-0 flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground tracking-wide flex items-center gap-2">
                  <Menu className="size-4 text-primary" />
                  <span>Saree Categories</span>
                </h3>
                {categoryList.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {categoryList.length}
                  </span>
                )}
              </div>

              {/* Scrollable Items List */}
              <div className="divide-y divide-border/50 flex-1 overflow-y-auto sleek-scrollbar">
                {/* Dynamic Category Items */}
                {categoryList.map((cat) => {
                  const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;

                  return (
                    <div key={cat._id || cat.slug} className="group/cat">
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                        className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-foreground/85 hover:text-primary hover:bg-muted/60 transition-colors"
                      >
                        <span className="truncate">{cat.name}</span>
                        {hasChildren && (
                          <ChevronRight className="size-3.5 text-muted-foreground group-hover/cat:text-primary transition-transform group-hover/cat:rotate-90" />
                        )}
                      </Link>

                      {/* Subcategories (accordion inside scroll container) */}
                      {hasChildren && (
                        <div className="hidden group-hover/cat:block bg-muted/40 px-3 py-1 space-y-0.5 border-l-2 border-primary/60 ml-4 mb-1 rounded-r-md">
                          {cat.children.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={`/products?category=${encodeURIComponent(sub.slug || cat.slug)}`}
                              className="block px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                            >
                              • {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hot sell Item (Pinned at bottom) */}
              <div className="border-t border-border/60 shrink-0 bg-card rounded-b-xl">
                <Link
                  href="/best-selling"
                  className="flex items-center justify-between px-4 py-2.5 text-[13px] font-bold text-[#e11d48] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 fill-[#e11d48]" />
                    <span>Hot sell</span>
                  </span>
                  <span className="rounded-xs bg-[#e11d48] px-1.5 py-0.2 text-[8px] font-extrabold text-white uppercase tracking-wider animate-pulse">
                    HOT
                  </span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Slider & 3 Promo Cards */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {/* Main Swiper Slider */}
            <div className="relative rounded-2xl overflow-hidden shadow-xs border border-border/40">
              <Swiper
                onSwiper={setMainSwiper}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                modules={[Autoplay, Pagination, Navigation]}
                speed={800}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={{
                  prevEl: ".hero-prev",
                  nextEl: ".hero-next",
                }}
                loop={banners.length > 1}
                className="hero-swiper w-full h-auto aspect-[2.1/1] sm:aspect-[2.5/1] md:aspect-[2.7/1] overflow-hidden"
              >
                {banners.map((banner, index) => (
                  <SwiperSlide key={banner._id}>
                    <Link href={banner.link || "/products"} className="block size-full">
                      <div className="relative size-full">
                        <img
                          src={banner.image || banner.images?.[0]}
                          alt={banner.title}
                          className="size-full object-cover object-center"
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "low"}
                        />
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
                {banners.length > 1 && (
                  <>
                    <button className="hero-prev absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:left-4 sm:size-10">
                      <ChevronLeft className="size-5" />
                    </button>
                    <button className="hero-next absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:right-4 sm:size-10">
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </Swiper>
            </div>

            {/* Synchronized Banner Thumbnails Row (Centered) */}
            {banners.length > 0 && (
              <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap w-full py-1">
                {banners.map((banner, index) => {
                  const isCurrent = activeIndex === index;

                  return (
                    <button
                      key={banner._id || index}
                      type="button"
                      onClick={() => {
                        if (mainSwiper) {
                          mainSwiper.slideToLoop(index);
                          setActiveIndex(index);
                        }
                      }}
                      className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 aspect-square size-10 sm:size-12 shrink-0 cursor-pointer text-left ${
                        isCurrent
                          ? "border-primary shadow-md scale-[1.02] ring-2 ring-primary/20 opacity-100"
                          : "border-border/60 hover:border-primary/50 opacity-60 hover:opacity-100"
                      }`}
                      title={banner.title || `Slide ${index + 1}`}
                    >
                      <img
                        src={banner.image || banner.images?.[0]}
                        alt={banner.title || `Thumbnail ${index + 1}`}
                        className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Active indicator bar */}
                      {isCurrent ? (
                        <div className="absolute inset-0 bg-primary/10 ring-1 ring-inset ring-primary">
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
