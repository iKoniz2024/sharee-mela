"use client";

import Link from 'next/link';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign, ShoppingCart, Package, FolderOpen,
  Clock, CheckCircle, Truck, XCircle, BarChart3,
} from "lucide-react";
import { getDashboardStats } from "@/services/order.api";
import { formatBDT } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-500", lightBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500", lightBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-500", lightBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Package },
  shipped: { label: "Shipped", color: "bg-cyan-500", lightBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500", lightBg: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", lightBg: "bg-red-500/10 text-red-600 dark:text-red-400", icon: XCircle },
};

function StatCard({ title, value, icon: Icon, color, loading, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex size-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-6" />
        </div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}

import usePageTitle from "@/hooks/usePageTitle";

export default function AdminDashboard() {
  const { siteName } = useSettings();
  usePageTitle("Admin Dashboard");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Helmet>
          <title>{`Admin Dashboard | ${siteName}`}</title>
        </Helmet>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalCategories = stats?.totalCategories ?? 0;
  const ordersByStatus = stats?.ordersByStatus ?? {};

  const maxStatusCount = Math.max(...Object.values(ordersByStatus), 1);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Dashboard | {siteName}</title>
      </Helmet>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          icon={DollarSign}
          color="bg-muted text-foreground"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="bg-muted text-foreground"
          delay={0.05}
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          color="bg-muted text-foreground"
          delay={0.1}
        />
        <StatCard
          title="Total Categories"
          value={totalCategories}
          icon={FolderOpen}
          color="bg-muted text-foreground"
          delay={0.15}
        />
      </div>

      {/* Main Charts / Layout Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Horizontal Bar Chart showing Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="size-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Order Status Distribution</h2>
          </div>
          
          <div className="space-y-5">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = ordersByStatus[key] || 0;
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              const relativeWidth = (count / maxStatusCount) * 100;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{config.label}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${relativeWidth}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${config.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Detailed Status Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Status Summary</h2>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-primary hover:underline">
              Manage Orders
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = ordersByStatus[key] || 0;
              
              return (
                <div 
                  key={key} 
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:shadow-sm"
                >
                  <div className={`mb-3 flex size-10 items-center justify-center rounded-full ${config.lightBg}`}>
                    <Icon className="size-5" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{config.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
