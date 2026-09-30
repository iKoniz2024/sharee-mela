"use client";

import Link from 'next/link';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Package, Eye, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColors = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-muted text-foreground border-border",
  processing: "bg-foreground text-background border-foreground",
  shipped: "bg-muted text-foreground border-border",
  delivered: "bg-primary text-primary-foreground border-primary",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function AdminOrders({ children }) {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
    staleTime: 10 * 60 * 1000,
  });

  const orders = Array.isArray(data) ? data : data?.orders ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => updateOrderStatus(id, orderStatus),
    onMutate: async ({ id, orderStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] });
      const previousOrders = queryClient.getQueryData(["admin-orders"]);
      queryClient.setQueryData(["admin-orders"], (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((o) => (o._id === id ? { ...o, orderStatus } : o));
        }
        return {
          ...old,
          orders: old.orders?.map((o) => (o._id === id ? { ...o, orderStatus } : o)) ?? [],
        };
      });
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["admin-orders"], context.previousOrders);
      }
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
    onSuccess: () => {
      toast.success("Order status updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] });
      const previousOrders = queryClient.getQueryData(["admin-orders"]);
      queryClient.setQueryData(["admin-orders"], (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.filter((o) => o._id !== deletedId);
        }
        return {
          ...old,
          orders: (old.orders || []).filter((o) => o._id !== deletedId),
          totalOrders: Math.max(0, (old.totalOrders || 0) - 1),
        };
      });
      return { previousOrders };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["admin-orders"], context.previousOrders);
      }
      toast.error(err?.response?.data?.message || "Failed to delete order");
    },
    onSuccess: () => {
      toast.success("Order deleted successfully");
      setDeletingId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  const totalPages = Math.ceil(filteredOrders.length / limit);
  const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  const statusCounts = orders.reduce((acc, o) => {
    const s = o.orderStatus || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatStatus = (s) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Orders | ${siteName}`}</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Orders ({filteredOrders.length})
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({orders.length})
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {formatStatus(status)}
            {statusCounts[status] ? ` (${statusCounts[status]})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <Package className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Payment</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order._id?.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingAddress?.phone || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {order.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    ৳{(order.totalPrice ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.orderStatus || "pending"}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: order._id,
                            orderStatus: e.target.value,
                          })
                        }
                        className={`appearance-none rounded-full border px-3 py-1 pr-7 text-xs font-medium ${
                          statusColors[order.orderStatus] || "bg-muted text-foreground"
                        } cursor-pointer focus:outline-none`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {formatStatus(s)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-current" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/orders/${order._id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      {deletingId === order._id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(order._id)}
                            className="h-7 text-xs px-2"
                          >
                            {deleteMutation.isPending ? "..." : "Delete"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(null)}
                            className="h-7 text-xs px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeletingId(order._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
