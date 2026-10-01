"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useRef, useMemo } from "react";
import { compressImage } from "@/utils/compressImage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Trash2, Camera, X, Package, Tag, Sliders, ImagePlus, Plus, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getProductById, updateProduct, deleteProduct } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { resolveCategoryAttributes } from "@/utils/categoryAttributes";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import CategorySelect from "@/components/ui/CategorySelect";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];



const updateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0").optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  stock: z.coerce.number().min(0).optional(),
  tags: z.string().optional(),
  brand: z.string().optional(),
  weight: z.coerce.number().optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  returnPolicy: z.string().optional(),
  minimumOrderQuantity: z.coerce.number().min(1).optional(),
});

function getAllCategorySlugs(categories) {
  const slugs = [];
  for (const parent of categories) {
    if (parent.slug) slugs.push(parent.slug);
    for (const child of parent.children ?? []) {
      if (child.slug) slugs.push(child.slug);
    }
  }
  return [...new Set(slugs)];
}

export default function AdminProductDetails({ children }) {
  const { siteName } = useSettings();
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [thumbnailDrag, setThumbnailDrag] = useState(false);
  const [imagesDrag, setImagesDrag] = useState(false);
  const thumbnailInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeMeasurements, setSizeMeasurements] = useState({});
  const [colorVariants, setColorVariants] = useState([]);
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorFile, setColorFile] = useState(null);
  const [colorPreview, setColorPreview] = useState("");
  const colorInputRef = useRef(null);
  const [dynamicAttributes, setDynamicAttributes] = useState({});

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = categoriesData ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(updateSchema),
    values: product
      ? {
        title: product.title ?? "",
        description: product.description ?? "",
        category: product.category ?? "",
        price: product.price ?? 0,
        discountPercentage: product.discountPercentage ?? 0,
        stock: product.stock ?? 0,
        tags: product.tags?.join(", ") ?? "",
        brand: product.brand ?? "",
        weight: product.weight ?? "",
        warrantyInformation: product.warrantyInformation ?? "",
        shippingInformation: product.shippingInformation ?? "",
        returnPolicy: product.returnPolicy ?? "",
        minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
      }
      : undefined,
  });

  const selectedCategorySlug = watch("category") || product?.category;
  const { allAttributes: currentCategoryAttributes, specifications: categorySpecifications, variants: categoryVariants } = useMemo(
    () => resolveCategoryAttributes(selectedCategorySlug, categories),
    [selectedCategorySlug, categories]
  );

  const activeMeasurementFields = useMemo(() => {
    if (categorySpecifications && categorySpecifications.length > 0) {
      return categorySpecifications.map((attr) => ({
        key: attr.key,
        label: attr.label || attr.key,
        placeholder: `e.g. ${attr.label}`,
      }));
    }
    return [
      { key: "long", label: "Length / Long (দৈর্ঘ্য)", placeholder: "e.g. 28" },
      { key: "body", label: "Body / Chest / Bohor (বুক / বহর)", placeholder: "e.g. 38" },
    ];
  }, [categorySpecifications]);

  // Sync sizes, measurements, colors, and form when product changes (render-time pattern)
  const [prevProductId, setPrevProductId] = useState(null);
  if (product && product._id !== prevProductId) {
    setPrevProductId(product._id);
    setSelectedSizes(product.sizes ?? []);
    setColorVariants(product.colors ?? []);
    setExistingImages(product.images ?? []);
    setDynamicAttributes(product.attributes ?? {});
    if (product.sizeMeasurements) {
      const initialMeasurements = {};
      product.sizeMeasurements.forEach(m => {
        const { size, _id, ...rest } = m;
        initialMeasurements[size] = rest;
      });
      setSizeMeasurements(initialMeasurements);
    } else {
      setSizeMeasurements({});
    }
    reset({
      title: product.title ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      price: product.price ?? 0,
      discountPercentage: product.discountPercentage ?? 0,
      stock: product.stock ?? 0,
      tags: product.tags?.join(", ") ?? "",
      brand: product.brand ?? "",
      weight: product.weight ?? "",
      warrantyInformation: product.warrantyInformation ?? "",
      shippingInformation: product.shippingInformation ?? "",
      returnPolicy: product.returnPolicy ?? "",
      minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
    });
  }

  const updateMutation = useMutation({
    mutationFn: (payload) => updateProduct(id, payload),
    onSuccess: (res, variables) => {
      toast.success("Product updated");
      queryClient.setQueryData(["admin-product", id], (old) => ({
        ...old,
        ...variables,
      }));
      queryClient.setQueryData(["admin-products"], (old) => {
        if (!old || !old.products) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p._id === id ? { ...p, ...variables } : p
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = e.path?.[e.path.length - 1];
          if (field) setError(field, { message: e.message });
        });
        toast.error("Please fix the errors below");
      } else {
        toast.error(data?.message || data?.error || "Failed to update product");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-products"] });
      const previousProducts = queryClient.getQueryData(["admin-products"]);
      queryClient.setQueryData(["admin-products"], (old) => {
        if (!old || !old.products) return old;
        return {
          ...old,
          products: old.products.filter((p) => p._id !== deletedId),
          totalProducts: Math.max(0, (old.totalProducts || 0) - 1),
        };
      });
      return { previousProducts };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["admin-products"], context.previousProducts);
      }
      toast.error(err?.response?.data?.message || "Failed to delete product");
    },
    onSuccess: () => {
      toast.success("Product deleted");
      router.push("/dashboard/products");
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const toBase64 = (file) => compressImage(file);

  const handleAddColorVariant = async () => {
    if (!colorNameInput.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    if (!colorFile && !colorPreview) {
      toast.error("Please upload an image for this color");
      return;
    }
    let imgStr = colorPreview;
    if (colorFile) {
      imgStr = await toBase64(colorFile);
    }
    setColorVariants((prev) => [...prev, { name: colorNameInput.trim(), image: imgStr }]);
    setColorNameInput("");
    setColorFile(null);
    setColorPreview("");
  };

  const handleRemoveColorVariant = (index) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData) => {
    let thumbnail = thumbnailPreview ? "" : (product.thumbnail ?? "");
    if (thumbnailFile) {
      thumbnail = await toBase64(thumbnailFile);
    }

    let images = [...existingImages];
    if (imageFiles.length > 0) {
      const newBase64Images = await Promise.all(imageFiles.map((f) => toBase64(f)));
      images = [...images, ...newBase64Images];
    }

    const processedColors = await Promise.all(
      colorVariants.map(async (c) => ({
        name: c.name,
        image: c.file ? await toBase64(c.file) : c.image,
      }))
    );

    if (!thumbnail && processedColors.length > 0) {
      thumbnail = processedColors[0].image;
    } else if (!thumbnail && images.length > 0) {
      thumbnail = images[0];
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      discountPercentage: formData.discountPercentage,
      stock: formData.stock,
      brand: formData.brand,
      weight: formData.weight || undefined,
      warrantyInformation: formData.warrantyInformation,
      shippingInformation: formData.shippingInformation,
      returnPolicy: formData.returnPolicy,
      minimumOrderQuantity: formData.minimumOrderQuantity || undefined,
      attributes: dynamicAttributes,
      sizes: selectedSizes,
      sizeMeasurements: selectedSizes.map((size) => {
        const mData = sizeMeasurements[size] || {};
        const measurementObj = { size };
        activeMeasurementFields.forEach((f) => {
          if (mData[f.key] !== undefined && mData[f.key] !== "") {
            measurementObj[f.key] = mData[f.key];
          }
        });
        return measurementObj;
      }),
      colors: processedColors,
      thumbnail,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      images,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Helmet>
          <title>{`Admin Product Details | ${siteName}`}</title>
        </Helmet>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <Helmet>
          <title>{`Admin Product Details | ${siteName}`}</title>
        </Helmet>
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button className="mt-4 rounded-lg" onClick={() => router.push("/dashboard/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Product Details | {siteName}</title>
      </Helmet>
      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => router.push("/dashboard/products")}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to Products
      </Button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <img
              src={product.thumbnail || product.images?.[0] || undefined}
              alt={product.title}
              className="size-16 shrink-0 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {product.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{product.brand} &middot; {product.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-4" data-icon="inline-start" />
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
                <span className="text-sm text-foreground">Delete this product?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(product._id)}
                >
                  {deleteMutation.isPending ? "..." : "Yes"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit Product</h2>
              <p className="text-xs text-muted-foreground">Update product specifications, inventory, variants, and media</p>
            </div>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto rounded-xl px-6 font-bold shadow-sm shrink-0"
            >
              <Save className="size-4 mr-1.5" />
              {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>

          {/* CARD 1: Basic Information */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              <Package className="size-4 text-primary" />
              <span>Basic Information</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Title *</label>
                <Input {...register("title")} placeholder="Product title" className={errors.title ? "border-destructive" : ""} />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <CategorySelect
                  categories={categories}
                  value={watch("category") || product?.category}
                  onChange={(slug) => setValue("category", slug, { shouldValidate: true, shouldDirty: true })}
                  error={errors.category?.message}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Brand</label>
                <Input {...register("brand")} placeholder="Brand name" />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Description *</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Detailed product description..."
                  className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* CARD 2: Pricing & Inventory */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              <Tag className="size-4 text-primary" />
              <span>Pricing & Stock</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Price (৳) *</label>
                <Input {...register("price")} type="number" step="0.01" placeholder="৳0.00" className={errors.price ? "border-destructive" : ""} />
                {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Discount (%)</label>
                <Input {...register("discountPercentage")} type="number" step="0.1" min="0" max="100" placeholder="0" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Stock *</label>
                <Input {...register("stock")} type="number" min="0" placeholder="0" className={errors.stock ? "border-destructive" : ""} />
                {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Min Order Qty</label>
                <Input {...register("minimumOrderQuantity")} type="number" min="1" placeholder="1" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Weight (g)</label>
                <Input {...register("weight")} type="number" step="0.1" placeholder="0" />
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Tags (comma separated)</label>
                <Input {...register("tags")} placeholder="e.g. shirt, cotton, casual, summer" />
              </div>
            </div>
          </div>

          {/* CARD 3: Specifications, Sizes & Variants */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              <Sliders className="size-4 text-primary" />
              <span>Specifications, Sizes & Variants</span>
            </div>

            {/* Dynamic Category Specifications & Variants */}
            {!selectedCategorySlug ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-muted/10">
                Please select a category above to view specifications & attributes.
              </div>
            ) : currentCategoryAttributes.length > 0 ? (
              <div className="space-y-5">
                {/* Product Specifications Section */}
                {categorySpecifications.length > 0 && (
                  <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h4 className="text-xs font-bold tracking-wide uppercase text-foreground flex items-center gap-1.5">
                        <Tag className="size-3.5 text-blue-500" /> Product Specifications
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{categorySpecifications.length} specs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categorySpecifications.map((attr) => {
                        const optionsList = Array.isArray(attr.options) ? attr.options : (typeof attr.options === "string" && attr.options.trim() ? attr.options.split(",").map(s => s.trim()) : []);

                        if (attr.type === "select") {
                          return (
                            <div key={attr.key} className="space-y-1">
                              <label className="text-xs font-medium text-foreground">{attr.label} {attr.unit ? `(${attr.unit})` : ''} {attr.required && "*"}</label>
                              <select
                                value={dynamicAttributes[attr.key] || ""}
                                onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-ring font-medium"
                              >
                                <option value="">Select {attr.label}</option>
                                {optionsList.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (attr.type === "multi-select") {
                          const selectedValues = Array.isArray(dynamicAttributes[attr.key]) ? dynamicAttributes[attr.key] : [];
                          return (
                            <div key={attr.key} className="sm:col-span-2 space-y-2">
                              <label className="text-xs font-medium text-foreground">{attr.label} {attr.unit ? `(${attr.unit})` : ''} {attr.required && "*"}</label>
                              <div className="flex flex-wrap gap-2">
                                {optionsList.map((opt) => {
                                  const isSelected = selectedValues.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        const next = isSelected ? selectedValues.filter(v => v !== opt) : [...selectedValues, opt];
                                        setDynamicAttributes(prev => ({ ...prev, [attr.key]: next }));
                                      }}
                                      className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${isSelected
                                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                                        : "border-border bg-background text-foreground hover:border-muted-foreground"
                                        }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        if (attr.type === "boolean") {
                          return (
                            <div key={attr.key} className="flex items-center gap-2 pt-2">
                              <input
                                type="checkbox"
                                id={`edit-attr-${attr.key}`}
                                checked={Boolean(dynamicAttributes[attr.key])}
                                onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [attr.key]: e.target.checked }))}
                                className="rounded border-border size-4 accent-primary"
                              />
                              <label htmlFor={`edit-attr-${attr.key}`} className="text-xs font-medium text-foreground cursor-pointer">
                                {attr.label}
                              </label>
                            </div>
                          );
                        }

                        return (
                          <div key={attr.key} className="space-y-1">
                            <label className="text-xs font-medium text-foreground">{attr.label} {attr.unit ? `(${attr.unit})` : ''} {attr.required && "*"}</label>
                            <Input
                              type={attr.type === "number" ? "number" : "text"}
                              placeholder={`Enter ${attr.label}`}
                              value={dynamicAttributes[attr.key] || ""}
                              onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))}
                              className="h-9 text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Option Variants Section */}
                {categoryVariants.length > 0 && (
                  <div className="space-y-4 rounded-xl border border-purple-500/30 p-4 bg-purple-500/5">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <h4 className="text-xs font-bold tracking-wide uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> Product Option Variants
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryVariants.map((attr) => {
                        const optionsList = Array.isArray(attr.options) ? attr.options : (typeof attr.options === "string" && attr.options.trim() ? attr.options.split(",").map(s => s.trim()) : []);
                        const isSizeVariant = attr.key === "size" || attr.key === "sizes" || attr.key === "shoe_size";
                        const selectedValues = isSizeVariant ? selectedSizes : (Array.isArray(dynamicAttributes[attr.key]) ? dynamicAttributes[attr.key] : []);

                        return (
                          <div key={attr.key} className="sm:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-foreground">{attr.label} {attr.required && "*"}</label>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Variant</span>
                            </div>

                            {optionsList.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {optionsList.map((opt) => {
                                  const isSelected = selectedValues.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        if (isSizeVariant) {
                                          const nextSizes = isSelected ? selectedSizes.filter(s => s !== opt) : [...selectedSizes, opt];
                                          setSelectedSizes(nextSizes);
                                          setDynamicAttributes(prev => ({ ...prev, [attr.key]: nextSizes }));
                                        } else {
                                          const next = isSelected ? selectedValues.filter(v => v !== opt) : [...selectedValues, opt];
                                          setDynamicAttributes(prev => ({ ...prev, [attr.key]: next }));
                                        }
                                      }}
                                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${isSelected
                                        ? "border-purple-600 bg-purple-600 text-white font-bold shadow-xs"
                                        : "border-border bg-background text-foreground hover:border-purple-400"
                                        }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <Input
                                placeholder={`Enter ${attr.label} variant choices (comma separated)`}
                                value={dynamicAttributes[attr.key] || ""}
                                onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))}
                                className="h-9 text-xs"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Measurements Chart Builder */}
                {selectedSizes.length > 0 && (
                  <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div>
                        <label className="block text-xs font-bold text-foreground">Size Measurements Chart Builder</label>
                        <p className="text-[11px] text-muted-foreground">Enter garment measurements per size</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedSizes.map((size) => {
                        return (
                          <div key={size} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
                            <div className="size-9 shrink-0 font-bold text-xs bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-xs">{size}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full">
                              {activeMeasurementFields.map((f) => (
                                <div key={f.key} className="space-y-1">
                                  <label className="text-[11px] font-medium text-muted-foreground block truncate">{f.label}</label>
                                  <Input
                                    placeholder={f.placeholder}
                                    value={sizeMeasurements[size]?.[f.key] || ""}
                                    onChange={(e) =>
                                      setSizeMeasurements((prev) => ({
                                        ...prev,
                                        [size]: { ...prev[size], [f.key]: e.target.value },
                                      }))
                                    }
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground bg-muted/10">
                No custom attributes configured for this category.
              </div>
            )}

            {/* Color Family Variants */}
            <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/10">
              <div>
                <label className="block text-xs font-bold text-foreground">Color Variants (Color Family with Image)</label>
                <p className="text-[11px] text-muted-foreground">Add color name and optionally attach a color swatch/product variant image</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <Input
                  placeholder="Color name (e.g. Navy Blue, Olive Green)"
                  value={colorNameInput}
                  onChange={(e) => setColorNameInput(e.target.value)}
                  className="flex-1 text-xs"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={colorInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setColorFile(file);
                      setColorPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => colorInputRef.current?.click()}
                  className="shrink-0 text-xs rounded-lg"
                >
                  <Camera className="size-3.5 mr-1" />
                  {colorPreview ? "Image Selected" : "Upload Color Image"}
                </Button>
                <Button
                  type="button"
                  onClick={handleAddColorVariant}
                  className="shrink-0 text-xs rounded-lg"
                >
                  Add Variant
                </Button>
              </div>
              {colorPreview && (
                <div className="flex items-center gap-2 pt-1">
                  <img src={colorPreview} alt="Color preview" className="size-10 rounded-lg border object-cover shadow-xs" />
                  <span className="text-xs text-muted-foreground">Image preview for {colorNameInput || "new color"}</span>
                </div>
              )}

              {colorVariants.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5 pt-2 border-t border-border/50">
                  {colorVariants.map((c, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pr-3 shadow-xs">
                      <img src={c.image} alt={c.name} className="size-8 rounded-lg object-cover border" />
                      <span className="text-xs font-semibold text-foreground">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColorVariant(index)}
                        className="ml-1 flex size-5 items-center justify-center rounded-full text-destructive hover:bg-destructive/15 transition-colors"
                        title="Remove color variant"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Policy and Logistics */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Warranty Info</label>
                <Input {...register("warrantyInformation")} placeholder="e.g. 1 Year Warranty" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Shipping Info</label>
                <Input {...register("shippingInformation")} placeholder="e.g. Delivery within 2-3 days" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Return Policy</label>
                <Input {...register("returnPolicy")} placeholder="e.g. 7 Days Return Policy" />
              </div>
            </div>
          </div>

          {/* CARD 4: Product Media */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              <ImagePlus className="size-4 text-primary" />
              <span>Product Media</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Thumbnail Image */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground">
                  Main Thumbnail Image <span className="font-normal text-muted-foreground">(Recommended: 1:1 Square / 800x800px)</span>
                </label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setThumbnailDrag(true); }}
                  onDragLeave={() => setThumbnailDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setThumbnailDrag(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className={`flex min-h-[140px] cursor-pointer items-center justify-center gap-4 rounded-xl border-2 border-dashed p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${thumbnailDrag ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-muted/10"}`}
                >
                  {(thumbnailPreview || product.thumbnail) ? (
                    <div className="flex items-center gap-3">
                      <img src={thumbnailPreview || product.thumbnail} alt="Thumbnail" className="size-24 rounded-xl object-cover ring-2 ring-primary/20 shadow-xs" />
                      <div className="text-xs">
                        <span className="font-semibold text-primary block">Thumbnail Active</span>
                        <span className="text-muted-foreground block text-[11px] mt-0.5">Click to replace image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-2">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Camera className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Upload Cover Image</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG up to 5MB • <strong>Aspect Ratio 1:1 (Square)</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground">
                  Gallery Images (Multiple) <span className="font-normal text-muted-foreground">(Recommended: 1:1 Square / 800x800px)</span>
                </label>
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setImageFiles((prev) => [...prev, ...files]);
                    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => imagesInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImagesDrag(true); }}
                  onDragLeave={() => setImagesDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImagesDrag(false);
                    const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                    if (files.length > 0) {
                      setImageFiles((prev) => [...prev, ...files]);
                      setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                    }
                  }}
                  className={`flex min-h-[140px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${imagesDrag ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-muted/10"}`}
                >
                  {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                    <div className="flex flex-wrap gap-3">
                      {/* Existing Product Images */}
                      {existingImages.map((src, i) => (
                        <div key={`existing-${i}`} className="relative group">
                          <img src={src} alt="" className="size-16 rounded-xl object-cover ring-2 ring-border shadow-xs" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(i);
                            }}
                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs hover:scale-110 transition-transform"
                            title="Delete image"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                      {/* Newly Uploaded Images */}
                      {imagePreviews.map((src, i) => (
                        <div key={`new-${i}`} className="relative group">
                          <img src={src} alt="" className="size-16 rounded-xl object-cover ring-2 ring-primary/40 shadow-xs" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNewImage(i);
                            }}
                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs hover:scale-110 transition-transform"
                            title="Remove image"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                      <div className="flex size-16 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-colors hover:bg-primary/10">
                        <Plus className="size-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-2">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ImagePlus className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Upload Product Gallery</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Select multiple images or drag & drop</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl px-6 font-bold shadow-sm"
            >
              <Save className="size-4 mr-1.5" />
              {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

