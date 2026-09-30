"use client";

import Link from 'next/link';

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBanners } from "@/services/banner.api";

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
`;

export default function Hero({ initialData }) {
  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
    initialData,
    staleTime: 10 * 60 * 1000,
  });

  const banners = (data ?? []).filter((b) => b.isActive && (b.image || b.images?.length > 0));

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
    <section id="hero" className="relative overflow-hidden py-4">
      <style>{heroStyles}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          speed={800}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: ".hero-prev",
            nextEl: ".hero-next",
          }}
          loop={banners.length > 1}
          className="hero-swiper w-full h-auto aspect-[2.3/1] sm:aspect-[2.8/1] md:aspect-[3.2/1] overflow-hidden shadow-sm"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner._id}>
              <Link href="/products" className="block size-full">
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
              <button className="hero-prev absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:left-5 sm:size-12">
                <ChevronLeft className="size-5" />
              </button>
              <button className="hero-next absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:right-5 sm:size-12">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </Swiper>
      </div>
    </section>
  );
}
