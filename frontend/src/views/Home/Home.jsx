"use client";

import { usePathname } from 'next/navigation';
import Categories from "@/components/sections/Categories";
import BestSellingProducts from "@/components/sections/BestSellingProducts";
import FlashSale from "@/components/sections/FlashSale";
import Hero from "@/components/sections/Hero";
import NewArrivals from "@/components/sections/NewArrivals";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FAQ from "@/components/sections/FAQ";
import useSettings from "@/hooks/useSettings";
// 
import { useEffect } from "react";

import { Helmet } from "react-helmet-async";
import usePageTitle from "@/hooks/usePageTitle";

export default function Home({ initialData }) {
  const { siteName } = useSettings();
  usePageTitle("Home");

  return (
    <div className="h-full">
      <Helmet>
        <title>{siteName ? `${siteName} | Home` : "Home | Sharee Mela"}</title>
      </Helmet>
      <Hero initialData={initialData?.bannersData} />
      <NewArrivals initialData={initialData?.newArrivalsData} />
      <Categories initialData={initialData?.categoriesData} />
      <BestSellingProducts initialData={initialData?.bestSellingData} />
      <FlashSale initialData={initialData?.flashSaleData} />
      {/* <WhyChooseUs /> */}
      <FAQ />
    </div>
  );
}
