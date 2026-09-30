"use client";

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from "react";
import RelatedProducts from "@/components/sections/RelatedProducts";

import { useQuery } from "@tanstack/react-query";
import {
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Home,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProductById } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { resolveCategoryAttributes } from "@/utils/categoryAttributes";
import { useAddToCart } from "@/hooks/useAddToCart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";



function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <Skeleton className="aspect-square w-full rounded-xl lg:w-1/2" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

import usePageTitle from "@/hooks/usePageTitle";
import { trackMetaPixelEvent } from "@/utils/metaPixel";

export default function ProductDetails({ id: propId, initialData }) {
  const { siteName } = useSettings();
  const routeParams = useParams();
  const id = propId || routeParams?.id;
  const router = useRouter();
  const { addToCart } = useAddToCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeDisplayImage, setActiveDisplayImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, show: false });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, show: false }));
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    initialData: initialData || undefined,
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categoryAttrsResolved = useMemo(() => {
    if (!product?.category || !categoriesData) return { allAttributes: [], specifications: [], variants: [] };
    return resolveCategoryAttributes(product.category, categoriesData);
  }, [product?.category, categoriesData]);

  const combinedAttributes = useMemo(() => {
    const map = new Map();
    (categoryAttrsResolved.allAttributes || []).forEach(attr => {
      if (attr && attr.key) map.set(attr.key, attr);
    });

    if (product?.attributes && typeof product.attributes === "object") {
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

      Object.entries(product.attributes).forEach(([key, val]) => {
        if (!val || (Array.isArray(val) && val.length === 0)) return;
        if (!map.has(key)) {
          const autoLabel = CUSTOM_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          map.set(key, { key, label: autoLabel, options: Array.isArray(val) ? val : [val] });
        }
      });
    }
    return Array.from(map.values());
  }, [categoryAttrsResolved.allAttributes, product?.attributes]);

  usePageTitle(product?.title || "Product Details");

  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
        if (product.colors[0].image) {
          setActiveDisplayImage(product.colors[0].image);
        }
      } else {
        setSelectedColor(null);
        setActiveDisplayImage(null);
      }

      // Initialize selectedVariants from product.attributes
      const prodAttrs = product.attributes || {};
      const initialVars = {};
      if (typeof prodAttrs === "object" && prodAttrs !== null) {
        Object.entries(prodAttrs).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length > 0) {
            initialVars[key] = val[0];
          } else if (typeof val === "string" && val.trim()) {
            initialVars[key] = val;
          } else if (typeof val === "number" || typeof val === "boolean") {
            initialVars[key] = String(val);
          }
        });
      }
      setSelectedVariants(initialVars);
    }
  }, [product?._id, categoryAttrsResolved]);

  useEffect(() => {
    if (id && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (product && product._id) {
      const currentPrice = product.discountPercentage > 0
        ? Number((product.price * (1 - product.discountPercentage / 100)).toFixed(2))
        : Number(product.price || 0);

      trackMetaPixelEvent("ViewContent", {
        content_name: product.title,
        content_ids: [String(product._id)],
        content_type: "product",
        value: currentPrice,
        currency: "BDT",
      });
    }
  }, [id, product]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (product.thumbnail) imgs.push(product.thumbnail);
    if (product.images?.length) {
      product.images.forEach((img) => {
        if (img !== product.thumbnail) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : [product.thumbnail];
  }, [product]);

  const hasDiscount = product?.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const handleAddToCart = async () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    const variantSummary = Object.values(selectedVariants).filter(Boolean).join(", ");
    const finalSize = selectedSize || variantSummary || "";

    await addToCart(
      product,
      quantity,
      finalSize,
      selectedColor?.name || "",
      selectedColor?.image || ""
    );
  };

  if (isLoading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button className="mt-4" onClick={() => router.push(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const mainDisplayImage = activeDisplayImage || allImages[selectedImage] || product.thumbnail;

  return (
    <>
      <Helmet>
        <title>{`${product.title} | ${siteName}`}</title>
      </Helmet>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            <Home className="size-4" />
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left - Images lg:w-[35%] */}
          <div className="flex flex-col gap-3 lg:w-[35%]">
            <div
              className="relative overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center cursor-zoom-in select-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={mainDisplayImage}
                alt={product.title}
                className="aspect-square max-h-[380px] sm:max-h-[440px] lg:max-h-[460px] w-full object-contain p-2 transition-transform duration-150 ease-out"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: zoomPos.show ? "scale(2.4)" : "scale(1)",
                }}
                loading="eager"
                fetchPriority="high"
              />
              {hasDiscount && (
                <div className="absolute left-3 top-3 z-10 pointer-events-none">
                  <Badge className="bg-secondary text-secondary-foreground text-xs font-semibold shadow-sm">
                    -{Math.round(product.discountPercentage)}%
                  </Badge>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImage(i);
                      setActiveDisplayImage(img);
                    }}
                    className={`size-16 shrink-0 overflow-hidden rounded-lg border transition-colors bg-muted/20 sm:size-20 ${img === mainDisplayImage
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-muted-foreground/50"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle - Product Info lg:w-[35%] */}
          <div className="flex flex-1 flex-col gap-4 lg:w-[35%]">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {product.title}
            </h1>

            {product.sku && (
              <p className="text-sm font-medium text-muted-foreground">
                SKU : {product.sku}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {formatBDT(hasDiscount ? discountedPrice : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-muted-foreground line-through">
                  {formatBDT(product.price)}
                </span>
              )}
            </div>

            {/* Color Family Selection */}
            {product?.colors?.length > 0 && (
              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    Color Family : <span className="font-normal text-muted-foreground">{selectedColor?.name || "Select a color"}</span>
                  </span>
                  <ChevronDown className="size-4 text-foreground" />
                </div>
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
                        className={`group relative flex items-center gap-2 rounded-lg border-2 p-1.5 transition-all ${isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 bg-background"
                          }`}
                      >
                        <div className="size-10 overflow-hidden rounded border border-border bg-muted shrink-0">
                          <img
                            src={colorObj.image || product.thumbnail}
                            alt={colorObj.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="pr-2 text-xs font-semibold text-foreground">
                          {colorObj.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product?.sizes?.length > 0 && (
              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    Select Size :
                  </span>
                  <button className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Category Option Variants (e.g. Saree Length, Fabric, etc.) */}
            {combinedAttributes.map((attr) => {
              const prodAttrValue = product?.attributes?.[attr.key];
              
              let options = [];
              if (Array.isArray(prodAttrValue)) {
                options = prodAttrValue;
              } else if (typeof prodAttrValue === "string" && prodAttrValue.includes(",")) {
                options = prodAttrValue.split(",").map((s) => s.trim()).filter(Boolean);
              } else if (attr.options) {
                const rawOpts = Array.isArray(attr.options)
                  ? attr.options
                  : typeof attr.options === "string"
                  ? attr.options.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                if (rawOpts.length > 0) options = rawOpts;
                else if (typeof prodAttrValue === "string" && prodAttrValue.trim()) options = [prodAttrValue.trim()];
              } else if (typeof prodAttrValue === "string" && prodAttrValue.trim()) {
                options = [prodAttrValue.trim()];
              }

              if (options.length === 0) return null;

              const currentSelected = selectedVariants[attr.key] || options[0];

              return (
                <div key={attr.key} className="space-y-2 border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {attr.label || attr.key} : <span className="font-normal text-muted-foreground">{currentSelected}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [attr.key]: opt }))}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          currentSelected === opt
                            ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Quantity and Order */}
            <div className="space-y-2">
              <span className="text-sm font-bold text-foreground">
                Select Quantity :
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex size-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="flex size-10 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex size-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {!isAdmin && (
                  <Button
                    size="lg"
                    className="flex-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold"
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                  >
                    অর্ডার করুন
                  </Button>
                )}
              </div>
            </div>

            {/* Find in Store */}
            <div className="pt-2">
              <button
                className="w-full flex items-center justify-center gap-2 rounded bg-muted/30 border border-border py-2 text-sm font-medium hover:bg-muted/50"
                onClick={() => toast("Find in Store feature coming soon!")}
              >
                Find in Store <ShoppingCart className="size-4" />
              </button>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-2 pt-2 justify-center">
              <a
                href={currentUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a
                href={currentUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}&url=${encodeURIComponent(currentUrl)}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a
                href={`https://instagram.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Right - Extra Info lg:w-[30%] */}
          <div className="flex flex-col gap-4 lg:w-[30%]">
            {/* Policies */}
            <div className="rounded border-2 border-dashed border-foreground p-4 text-xs font-medium text-foreground">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 size-3 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  <span>পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 size-3 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  <span>৭ দিনের রিটার্ন পলিসি</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 size-3 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  <span>দ্রুত সময়ের মধ্যে সারা বাংলাদেশে "হোম ডেলিভারি"</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 size-3 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  <span>24/7 কাস্টমার সাপোর্ট: <a href="/orders" className="text-foreground hover:underline">Order Tracking</a></span>
                </li>
              </ul>
            </div>

            {/* Dynamic Size Measurement Block */}
            {product?.sizeMeasurements && product.sizeMeasurements.length > 0 ? (() => {
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
                <div className="mt-2 overflow-hidden rounded border border-border">
                  <div className="bg-muted py-2 text-center text-sm font-bold text-foreground">
                    Size Measurement (Inches)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                          <th className="px-3 py-2 font-semibold text-center">Size</th>
                          {columnKeys.map((key) => (
                            <th key={key} className="px-3 py-2 font-semibold text-center">
                              {FIELD_LABELS[key] || key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {product.sizeMeasurements.map((m, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-bold text-foreground text-center">{m.size}</td>
                            {columnKeys.map((key) => (
                              <td key={key} className="px-3 py-2 text-foreground text-center">
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
            })() : product?.sizeChart ? (
              <div className="mt-2 overflow-hidden rounded border border-border">
                <div className="bg-muted py-2 text-center text-sm font-bold text-foreground">
                  Size Measurement
                </div>
                <div className="p-2">
                  <img
                    src={product.sizeChart}
                    alt="Size Measurement"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            ) : null}

            {/* Product Details & Specifications Card */}
            <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold tracking-wider uppercase text-foreground border-b border-border/60 pb-2">
                Product Details & Specifications
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">Category:</span>
                  <span className="font-bold text-foreground capitalize">{product.category}</span>
                </div>
                {product.attributes && typeof product.attributes === "object" &&
                  Object.entries(product.attributes).map(([key, val]) => {
                    if (!val || (Array.isArray(val) && val.length === 0)) return null;
                    const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
                    const matchingAttr = combinedAttributes.find(a => a.key === key);
                    const label = matchingAttr?.label || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground font-medium">{label}:</span>
                        <span className="font-bold text-foreground text-right pl-2">{displayVal}</span>
                      </div>
                    );
                  })
                }
                {product.brand && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground font-medium">Brand:</span>
                    <span className="font-bold text-foreground">{product.brand}</span>
                  </div>
                )}
                {product.stock !== undefined && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">Availability:</span>
                    <span className={`font-bold ${product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Truck className="size-6 text-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Fast Shipping
              </p>
              <p className="text-xs text-muted-foreground">
                {product.shippingInformation || "Receive products in amazing time"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Shield className="size-6 text-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Always Authentic Product
              </p>
              <p className="text-xs text-muted-foreground">
                100% authentic products
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <RotateCcw className="size-6 text-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                7 Day Returns
              </p>
              <p className="text-xs text-muted-foreground">
                {product.returnPolicy || "Return within 7 days"}
              </p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-10 border-t border-border pt-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Description</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} />
      </div>
    </>
  );
}
