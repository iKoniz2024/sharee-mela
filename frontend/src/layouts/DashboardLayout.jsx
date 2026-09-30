"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/views/sharedPages/Sidebar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Menu, LayoutDashboard, ShoppingBag, ShoppingCart, Tags, Settings } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { getAllOrders, getDashboardStats } from "@/services/order.api";
import { getSettings } from "@/services/settings.api";

export default function DashboardLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrefetch = (path) => {
    const staleTime = 10 * 60 * 1000;
    if (path === "/dashboard") {
      queryClient.prefetchQuery({ queryKey: ["admin-dashboard-stats"], queryFn: getDashboardStats, staleTime });
    } else if (path === "/dashboard/products") {
      queryClient.prefetchQuery({ queryKey: ["admin-products"], queryFn: getProducts, staleTime });
      queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime });
    } else if (path === "/dashboard/categories") {
      queryClient.prefetchQuery({ queryKey: ["admin-categories"], queryFn: getCategories, staleTime });
    } else if (path === "/dashboard/orders") {
      queryClient.prefetchQuery({ queryKey: ["admin-orders"], queryFn: getAllOrders, staleTime });
    } else if (path === "/dashboard/settings") {
      queryClient.prefetchQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime });
    }
  };

  return (
    <div className="flex h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted lg:hidden"
          title="Open menu"
        >
          <Menu className="size-4" />
        </button>
        <div />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
            title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/dashboard/profile");
                      }}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                        router.push("/login");
                      }}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Fixed Admin Bottom Navigation Bar for Mobile & Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md lg:hidden shadow-2xl">
        <div className="grid grid-cols-5 items-center px-1 py-2">
          <Link
            href="/dashboard"
            onMouseEnter={() => handlePrefetch("/dashboard")}
            onTouchStart={() => handlePrefetch("/dashboard")}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname === "/dashboard" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="size-5" />
            <span>Stats</span>
          </Link>

          <Link
            href="/dashboard/products"
            onMouseEnter={() => handlePrefetch("/dashboard/products")}
            onTouchStart={() => handlePrefetch("/dashboard/products")}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith("/dashboard/products") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="size-5" />
            <span>Products</span>
          </Link>

          <Link
            href="/dashboard/orders"
            onMouseEnter={() => handlePrefetch("/dashboard/orders")}
            onTouchStart={() => handlePrefetch("/dashboard/orders")}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith("/dashboard/orders") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingCart className="size-5" />
            <span>Orders</span>
          </Link>

          <Link
            href="/dashboard/categories"
            onMouseEnter={() => handlePrefetch("/dashboard/categories")}
            onTouchStart={() => handlePrefetch("/dashboard/categories")}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith("/dashboard/categories") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tags className="size-5" />
            <span>Categories</span>
          </Link>

          <Link
            href="/dashboard/settings"
            onMouseEnter={() => handlePrefetch("/dashboard/settings")}
            onTouchStart={() => handlePrefetch("/dashboard/settings")}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname.startsWith("/dashboard/settings") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="size-5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
