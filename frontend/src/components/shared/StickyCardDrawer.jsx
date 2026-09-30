"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import useCart from "@/hooks/useCart";
import { formatBDT } from "@/utils/currency";
import { getLocalCart, removeFromLocalCart, getLocalCartCount } from "@/utils/localCart";
import { useAuth } from "@/hooks/useAuth";

export default function StickyCartDrawer() {
  const { cartCount, refetchCartCount } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: cart, isFetching, refetch } = useQuery({
    queryKey: ["localCart"],
    queryFn: () => {
      const items = getLocalCart();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { items, totalItems, totalPrice };
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  useEffect(() => {
    const handleCartUpdated = () => setOpen(true);
    const handleOpenDrawer = () => setOpen(true);
    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("open-cart-drawer", handleOpenDrawer);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("open-cart-drawer", handleOpenDrawer);
    };
  }, []);

  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * (item.quantity ?? 1)),
    0
  );

  const removeMutation = useMutation({
    mutationFn: ({ productId, size }) => {
      removeFromLocalCart(productId, size);
      return Promise.resolve();
    },
    onMutate: async ({ productId, size }) => {
      await queryClient.cancelQueries({ queryKey: ["localCart"] });
      const previousCart = queryClient.getQueryData(["localCart"]);
      queryClient.setQueryData(["localCart"], (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter(
            (item) => !(item.productId === productId && (item.size || "") === (size || ""))
          ),
        };
      });
      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["localCart"], context.previousCart);
      }
      toast.error("Unable to remove item from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["localCart"] });
      refetchCartCount(getLocalCartCount());
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (isAdmin) return null;

  const content = (
    <div className={`fixed inset-0 z-9998 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`fixed inset-0 z-9998 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 z-9999 w-full max-w-sm overflow-y-auto bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Cart Summary</p>
            <p className="text-xs text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={() => setOpen(false)}
            aria-label="Close cart drawer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          {isFetching && !items.length ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 rounded-xl bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm font-semibold text-foreground">Your cart is empty</p>
              <p className="text-xs text-muted-foreground">
                Add products to your cart and open the drawer to checkout.
              </p>
              <Button asChild className="mx-auto mt-3 rounded-lg px-4 py-2">
                <Link href="/products" onClick={() => setOpen(false)}>
                  Browse products
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-start gap-3 rounded-3xl border border-border bg-card p-3">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title || "Product"} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground/30">
                      <ShoppingCart className="size-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title || "Product"}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      {item.color && <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">Color: {item.color}</span>}
                      {item.size && <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">Size: {item.size}</span>}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {item.price ? formatBDT(item.price * item.quantity) : "N/A"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeMutation.mutate({ productId: item.productId, size: item.size || "" })}
                    aria-label={`Remove ${item.title || "item"} from cart`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-4 py-4">
          <div className="mb-3 flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatBDT(totalPrice)}</span>
          </div>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setOpen(false);
              router.push("/checkout");
            }}
            disabled={items.length === 0}
          >
            Go to Checkout
          </button>
          <Link href="/cart" className="mt-3 block text-center text-sm text-primary underline" onClick={() => setOpen(false)}>
            View full cart
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
