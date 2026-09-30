"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAddToCart } from "@/hooks/useAddToCart";
import { formatBDT } from "@/utils/currency";
import { getCategories } from "@/services/category.api";
import { resolveCategoryAttributes } from "@/utils/categoryAttributes";

export default function OrderModal({ product, open, onClose }) {
  const router = useRouter();
  const { addToCart } = useAddToCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeDisplayImage, setActiveDisplayImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categoryAttrsResolved = useMemo(() => {
    if (!product?.category || !categoriesData) return { allAttributes: [], specifications: [], variants: [] };
    return resolveCategoryAttributes(product.category, categoriesData);
  }, [product?.category, categoriesData]);

  const dynamicVariantMap = useMemo(() => {
    const CUSTOM_LABELS = {
      saree_length: "Saree Length (কয় হাত লম্বা)",
      lomba: "Length (দৈর্ঘ্য / লম্বা)",
      color: "Color (রং)",
      fabric: "Fabric (ফেব্রিক)",
      material: "Material (উপাদান)",
      work: "Work / Design",
      chest: "Chest (বুক)",
      shoulder: "Shoulder (কাধ)",
      waist: "Waist (কোমর)",
    };

    const map = new Map();

    // 1. Category attributes
    (categoryAttrsResolved.allAttributes || []).forEach((attr) => {
      if (!attr || !attr.key) return;
      const opts = Array.isArray(attr.options)
        ? attr.options
        : typeof attr.options === "string" && attr.options.trim()
        ? attr.options.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (opts.length > 0) {
        map.set(attr.key, {
          key: attr.key,
          label: attr.label || CUSTOM_LABELS[attr.key] || attr.key,
          options: opts,
        });
      }
    });

    // 2. Product saved attributes
    if (product?.attributes && typeof product.attributes === "object") {
      Object.entries(product.attributes).forEach(([key, val]) => {
        if (!val) return;
        let opts = [];
        if (Array.isArray(val)) {
          opts = val.map((s) => String(s).trim()).filter(Boolean);
        } else if (typeof val === "string" && val.includes(",")) {
          opts = val.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (typeof val === "string" && val.trim()) {
          opts = [val.trim()];
        }

        if (opts.length > 0) {
          const label = CUSTOM_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          map.set(key, { key, label, options: opts });
        }
      });
    }

    // 3. Smart fallback for Saree/Sharee categories if no size or length attribute exists
    const catLower = String(product?.category || "").toLowerCase();
    const isSareeCat =
      catLower.includes("sharee") ||
      catLower.includes("saree") ||
      catLower.includes("jamdani") ||
      catLower.includes("shari");

    if (isSareeCat && !map.has("saree_length") && (!product?.sizes || product.sizes.length === 0)) {
      map.set("saree_length", {
        key: "saree_length",
        label: "Saree Length (কয় হাত লম্বা)",
        options: ["১২ হাত", "১৪ হাত"],
      });
    }

    return Array.from(map.values());
  }, [product?.attributes, product?.category, product?.sizes, categoryAttrsResolved.allAttributes]);

  useEffect(() => {
    if (open && product) {
      setSelectedSize(null);
      setSelectedColor(product?.colors?.[0] || null);
      setActiveDisplayImage(product?.colors?.[0]?.image || null);
      setQuantity(1);
      
      const init = {};
      dynamicVariantMap.forEach((item) => {
        if (item.options.length === 1) {
          init[item.key] = item.options[0];
        }
      });
      setSelectedVariants(init);
    }
  }, [open, product, dynamicVariantMap]);

  if (!open || !product) return null;

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;
  const isOutOfStock = product.stock === 0;

  const validateAndAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return false;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return false;
    }
    for (const vItem of dynamicVariantMap) {
      if (!selectedVariants[vItem.key]) {
        toast.error(`Please select ${vItem.label}`);
        return false;
      }
    }

    const variantSummary = Object.entries(selectedVariants)
      .map(([k, v]) => v)
      .filter(Boolean)
      .join(", ");

    const finalSize = selectedSize || variantSummary || "";

    await addToCart(
      product,
      quantity,
      finalSize,
      selectedColor?.name || "",
      selectedColor?.image || ""
    );
    return true;
  };

  const handleAddToCart = async () => {
    const success = await validateAndAddToCart();
    if (success) {
      onClose();
    }
  };

  const handleOrderNow = async () => {
    const success = await validateAndAddToCart();
    if (success) {
      onClose();
      router.push("/checkout");
    }
  };

  const previewImage = activeDisplayImage || product.thumbnail || product.images?.[0] || null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4 sm:p-6" onClick={onClose}>
      <div
        className="my-auto w-full max-w-2xl rounded-xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Choose Options</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 sm:flex-row max-h-[75vh] overflow-y-auto">
          <div className="shrink-0">
            <div className="size-40 overflow-hidden rounded-xl border border-border bg-muted sm:size-48">
              <img
                src={previewImage}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h4 className="text-base font-semibold text-foreground sm:text-lg">
                {product.title}
              </h4>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatBDT(hasDiscount ? discountedPrice : product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBDT(product.price)}
                  </span>
                )}
              </div>
            </div>

            {product.colors?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Choose Color : <span className="font-normal text-muted-foreground">{selectedColor?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorObj, index) => {
                    const isSelected = selectedColor?.name === colorObj.name;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedColor(colorObj);
                          if (colorObj.image) {
                            setActiveDisplayImage(colorObj.image);
                          }
                        }}
                        className={`flex items-center gap-2 rounded-lg border-2 p-1.5 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 bg-background"
                        }`}
                      >
                        <div className="size-8 overflow-hidden rounded border border-border bg-muted shrink-0">
                          <img
                            src={colorObj.image || product.thumbnail}
                            alt={colorObj.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="pr-1.5 text-xs font-semibold text-foreground">
                          {colorObj.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Choose Size : <span className="font-normal text-muted-foreground">{selectedSize || "Select size"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dynamicVariantMap.length > 0 && (
              dynamicVariantMap.map((vItem) => (
                <div key={vItem.key}>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Choose {vItem.label} : <span className="font-normal text-muted-foreground">{selectedVariants[vItem.key] || "Select option"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vItem.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [vItem.key]: opt }))}
                        className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          selectedVariants[vItem.key] === opt
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Choose Quantity</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
                >
                  <Minus className="size-4" />
                </button>
                <span className="flex size-10 items-center justify-center rounded-lg border border-border text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Size Measurement Table in Modal */}
            {product?.sizeMeasurements && product.sizeMeasurements.length > 0 && (() => {
              const columnKeysSet = new Set();
              product.sizeMeasurements.forEach((m) => {
                Object.keys(m || {}).forEach((k) => {
                  if (k !== "size" && k !== "_id" && m[k]) columnKeysSet.add(k);
                });
              });
              const columnKeys = Array.from(columnKeysSet);

              const FIELD_LABELS = {
                chest: "Chest (বুক)",
                long: "Length (দৈর্ঘ্য)",
                body: "Body (বুক)",
                shoulder: "Shoulder (কাধ)",
                sleeve: "Sleeve (হাতা)",
                waist: "Waist (কোমর)",
                hip: "Hip (হিপ)",
                thigh: "Thigh (রান)",
                saree_length: "Saree Length (কয় হাত)",
                bohor: "Bohor (বহর)",
                blouse_piece: "Blouse Piece",
                ageGroup: "Age (বয়স)",
                footLength: "Foot Length",
                euSize: "EU/UK Size",
              };

              return (
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <div className="bg-muted py-1.5 text-center text-xs font-bold text-foreground">
                    Size Measurement Guide
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                          <th className="px-2.5 py-1.5 font-semibold text-center">Size</th>
                          {columnKeys.map((key) => (
                            <th key={key} className="px-2.5 py-1.5 font-semibold text-center">
                              {FIELD_LABELS[key] || key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {product.sizeMeasurements.map((m, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-2.5 py-1.5 font-bold text-foreground text-center">{m.size}</td>
                            {columnKeys.map((key) => (
                              <td key={key} className="px-2.5 py-1.5 text-foreground text-center">
                                {m[key] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Dynamic Product Attributes / Specifications in Modal */}
            {product?.attributes && typeof product.attributes === "object" && Object.keys(product.attributes).length > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1.5 text-xs">
                <span className="font-semibold text-foreground block border-b border-border/40 pb-1 text-[11px] uppercase tracking-wider">
                  Product Details
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(product.attributes).map(([key, val]) => {
                    if (!val || (Array.isArray(val) && val.length === 0)) return null;
                    const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
                    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between text-muted-foreground">
                        <span className="font-medium capitalize">{label}:</span>
                        <span className="font-bold text-foreground">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50 shadow-xs"
          >
            <ShoppingCart className="size-4" />
            Add to cart
          </button>
          <button
            type="button"
            onClick={handleOrderNow}
            disabled={isOutOfStock}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
