"use client";

import { Suspense } from "react";
import Navbar from "@/views/sharedPages/Navbar";
import Footer from "@/views/sharedPages/Footer";
import FloatingButtons from "@/components/ui/FloatingButtons";
import StickyCardDrawer from "@/components/shared/StickyCardDrawer";
import RecentSalesToast from "@/components/RecentSalesToast";

export default function MainLayout({ children }) {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <Suspense fallback={<div className="h-16 sm:h-20 bg-background" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>

        <Footer />
      </div>

      <FloatingButtons />
      <StickyCardDrawer />
      <RecentSalesToast />
    </>
  );
}
