"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, X, FolderTree, ChevronRight, Pencil, Save, Upload, Sliders } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const attributeDefSchema = z.object({
  key: z.string().min(1, "Key is required"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "number", "select", "multi-select", "boolean"]).default("text"),
  options: z.union([z.string(), z.array(z.string())]).optional().default([]),
  required: z.boolean().optional().default(false),
  unit: z.string().optional().default(""),
  useAsVariant: z.boolean().optional().default(false),
});

const createCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Slug is required"),
  attributes: z.array(attributeDefSchema).optional().default([]),
  children: z.array(
    z.object({
      name: z.string().min(2, "Child name is required"),
      slug: z.string().min(2, "Child slug is required"),
      categories: z.array(z.string()).optional().default([]),
    })
  ).optional().default([]),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  attributes: z.array(attributeDefSchema).optional(),
  children: z.array(
    z.object({
      name: z.string().min(2, "Child name must be at least 2 characters"),
      slug: z.string().min(2, "Child slug must be at least 2 characters"),
      categories: z.array(z.string()).optional().default([]),
    })
  ).optional(),
});

function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

import { compressImage } from "@/utils/compressImage";

const toBase64 = (file) => compressImage(file);

export default function AdminCategories({ children }) {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [createImage, setCreateImage] = useState("");
  const [editImage, setEditImage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = data ?? [];

  const {
    register: regCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errCreate },
    reset: resetCreate,
    setError: setErrorCreate,
    control: controlCreate,
    watch: watchCreate,
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", slug: "", attributes: [], children: [] },
  });

  const { fields: createFields, append: createAppend, remove: createRemove } = useFieldArray({
    control: controlCreate,
    name: "children",
  });

  const { fields: createAttrFields, append: createAttrAppend, remove: createAttrRemove } = useFieldArray({
    control: controlCreate,
    name: "attributes",
  });

  const {
    register: regUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errUpdate },
    reset: resetUpdate,
    setError: setErrorUpdate,
    control: controlUpdate,
    watch: watchUpdate,
  } = useForm({
    resolver: zodResolver(updateCategorySchema),
  });

  const { fields: updateFields, append: updateAppend, remove: updateRemove } = useFieldArray({
    control: controlUpdate,
    name: "children",
  });

  const { fields: updateAttrFields, append: updateAttrAppend, remove: updateAttrRemove } = useFieldArray({
    control: controlUpdate,
    name: "attributes",
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (res, variables) => {
      toast.success("Category created");
      queryClient.setQueryData(["admin-categories"], (old) => {
        const newCategory = {
          _id: res?.insertedId || res?._id || Date.now().toString(),
          ...variables,
        };
        return [...(old || []), newCategory];
      });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setShowForm(false);
      resetCreate();
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = e.path?.[e.path.length - 1];
          if (field) setErrorCreate(field, { message: e.message });
        });
        toast.error("Please fix the errors below");
      } else {
        toast.error(data?.message || data?.error || "Failed to create category");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: (res, variables) => {
      toast.success("Category updated");
      queryClient.setQueryData(["admin-categories"], (old) => {
        return (old || []).map((c) =>
          c._id === variables.id ? { ...c, ...variables.payload } : c
        );
      });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingId(null);
      resetUpdate();
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = e.path?.[e.path.length - 1];
          if (field) setErrorUpdate(field, { message: e.message });
        });
        toast.error("Please fix the errors below");
      } else {
        toast.error(data?.message || data?.error || "Failed to update category");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previousCategories = queryClient.getQueryData(["admin-categories"]);
      queryClient.setQueryData(["admin-categories"], (old) =>
        (old || []).filter((c) => c._id !== deletedId)
      );
      return { previousCategories };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["admin-categories"], context.previousCategories);
      }
      toast.error(err?.response?.data?.message || "Failed to delete category");
    },
    onSuccess: () => {
      toast.success("Category deleted");
      setDeletingId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const processAttributes = (attrs) => {
    if (!Array.isArray(attrs)) return [];
    return attrs.map((attr) => ({
      key: (attr.key || "").trim().toLowerCase().replace(/\s+/g, "_"),
      label: (attr.label || "").trim(),
      type: attr.type || "text",
      options: typeof attr.options === "string"
        ? attr.options.split(",").map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(attr.options) ? attr.options : []),
      required: Boolean(attr.required),
      unit: (attr.unit || "").trim(),
      useAsVariant: Boolean(attr.useAsVariant),
    }));
  };

  const onCreateSubmit = (formData) => {
    const payload = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
      image: createImage,
      attributes: processAttributes(formData.attributes),
      children: formData.children.map((child) => ({
        name: child.name,
        slug: child.slug.toLowerCase().replace(/\s+/g, "-"),
        categories: child.categories || [],
      })),
    };
    createMutation.mutate(payload);
  };

  const onUpdateSubmit = (formData) => {
    const payload = {};
    if (formData.name) payload.name = formData.name;
    if (formData.slug) payload.slug = formData.slug.toLowerCase().replace(/\s+/g, "-");
    if (editImage) payload.image = editImage;
    if (formData.attributes) payload.attributes = processAttributes(formData.attributes);
    if (formData.children) {
      payload.children = formData.children.map((child) => ({
        name: child.name,
        slug: child.slug.toLowerCase().replace(/\s+/g, "-"),
        categories: child.categories || [],
      }));
    }
    updateMutation.mutate({ id: editingId, payload });
  };

  const handleCreateImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    const base64 = await toBase64(file);
    setCreateImage(base64);
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    const base64 = await toBase64(file);
    setEditImage(base64);
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditImage(cat.image || "");
    resetUpdate({
      name: cat.name,
      slug: cat.slug,
      attributes: (cat.attributes ?? []).map((a) => ({
        ...a,
        options: Array.isArray(a.options) ? a.options.join(", ") : (a.options || ""),
        useAsVariant: Boolean(a.useAsVariant),
      })),
      children: (cat.children ?? []).map((child) => ({
        name: child.name,
        slug: child.slug,
        categories: child.categories ?? [],
      })),
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Categories | ${siteName}`}</title>
      </Helmet>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Categories ({categories.length})
        </h1>
        <Button onClick={() => setShowForm(true)} className="self-start">
          <Plus className="size-4" data-icon="inline-start" />
          Add Category
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="size-4" />
              </button>

              <h2 className="mb-6 text-lg font-semibold text-foreground">Add New Category</h2>

              <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
                    <Input
                      {...regCreate("name")}
                      placeholder="e.g. Electronics"
                      className={errCreate.name ? "border-destructive" : ""}
                      onChange={(e) => {
                        regCreate("name").onChange(e);
                        const slugField = document.querySelector('[name="slug"]');
                        if (slugField && !slugField.value) {
                          slugField.value = generateSlug(e.target.value);
                        }
                      }}
                    />
                    {errCreate.name && <p className="mt-1 text-xs text-destructive">{errCreate.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Slug *</label>
                    <Input
                      {...regCreate("slug")}
                      placeholder="e.g. electronics"
                      className={errCreate.slug ? "border-destructive" : ""}
                    />
                    {errCreate.slug && <p className="mt-1 text-xs text-destructive">{errCreate.slug.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Category Image <span className="text-xs text-muted-foreground font-normal">(Recommended: 1:1 Square / 400x400px)</span>
                  </label>
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
                    {createImage ? (
                      <img src={createImage} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground text-center">
                        <Upload className="size-8" />
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs">PNG, JPG up to 2MB • <strong>1:1 Square Ratio</strong></p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCreateImageUpload} />
                  </label>
                  {createImage && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-destructive hover:text-foreground"
                      onClick={() => setCreateImage("")}
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {/* Category Dynamic Attribute Definitions Section */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="space-y-2 border-b border-border/40 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="size-4 text-primary" />
                        Dynamic Category Attribute Builder
                      </h3>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="h-7 text-xs w-full sm:w-auto shrink-0"
                        onClick={() => createAttrAppend({ key: "", label: "", type: "text", options: "", required: false, unit: "", useAsVariant: false })}
                      >
                        <Plus className="size-3 mr-1" /> Custom Attribute
                      </Button>
                    </div>
                    
                    {/* Quick Add Presets for Saree Store */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Add:</span>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "saree_length", label: "Saree Length (হাত)", type: "select", options: "12 Hands (5.5m), 14 Hands with Blouse Piece (6.3m), 10 Hands, 8 Hands (Kids), 6 Hands (Kids)", required: false, unit: "Hands", useAsVariant: false })}>+ Saree Length</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "fabric", label: "Fabric / Material", type: "select", options: "Jamdani, Katan, Silk, Half Silk, Cotton, Georgette, Muslin, Organza, Tussar Silk", required: false, unit: "", useAsVariant: false })}>+ Fabric</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "blouse_piece", label: "Blouse Piece", type: "select", options: "Included (ব্লাউজ পিস সহ), Not Included (ব্লাউজ পিস ছাড়া), Running Blouse Piece", required: false, unit: "", useAsVariant: false })}>+ Blouse Piece</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "color", label: "Color", type: "multi-select", options: "Red, Maroon, Pink, Blue, Green, Yellow, Black, White, Gold, Purple, Orange, Magenta", required: false, unit: "", useAsVariant: true })}>+ Color</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "width", label: "Width (বহর)", type: "select", options: "42 Inches, 45 Inches, 48 Inches, 50 Inches", required: false, unit: "Inches", useAsVariant: false })}>+ Width / Bahar</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "work_type", label: "Work / Design", type: "select", options: "Handloom (হস্তচালিত), Embroidery, Zari Work, Print, Weaving, Hand Paint", required: false, unit: "", useAsVariant: false })}>+ Work / Design</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "age_range", label: "Age Range", type: "select", options: "2-4 Years, 5-7 Years, 8-10 Years, 11-14 Years, Adult", required: false, unit: "", useAsVariant: false })}>+ Age Range</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "occasion", label: "Occasion", type: "select", options: "Bridal / Wedding, Party Wear, Casual / Daily Wear, Festival / Pohela Boishakh, Traditional", required: false, unit: "", useAsVariant: false })}>+ Occasion</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "wash_care", label: "Wash Care", type: "select", options: "Dry Clean Only, Hand Wash, Machine Wash", required: false, unit: "", useAsVariant: false })}>+ Wash Care</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "stitch_type", label: "Stitch Type", type: "select", options: "Unstitched (সাধারণ শাড়ি), Ready to Wear / Pre-stitched (সেলাই করা রেডিমেড শাড়ি)", required: false, unit: "", useAsVariant: false })}>+ Stitch Type</Button>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => createAttrAppend({ key: "size", label: "Size", type: "multi-select", options: "XS, S, M, L, XL, XXL, 3XL", required: false, unit: "", useAsVariant: true })}>+ Clothing Size</Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {createAttrFields.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg bg-background">
                        No category attributes configured yet.
                      </p>
                    )}

                    {createAttrFields.map((field, index) => {
                      const currentType = watchCreate(`attributes.${index}.type`);
                      const isVariant = watchCreate(`attributes.${index}.useAsVariant`);
                      const needsOptions = currentType === "select" || currentType === "multi-select";
                      return (
                        <div key={field.id} className="relative rounded-xl border border-border/80 bg-background p-3.5 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">#{index + 1}</span>
                              {isVariant ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                  Option Variant
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                  Product Specification
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => createAttrRemove(index)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                              title="Remove attribute"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-foreground block mb-1">
                                Attribute Title / Field Name
                              </label>
                              <Input
                                {...regCreate(`attributes.${index}.label`)}
                                placeholder="Size, Material, RAM, etc."
                                className="h-9 text-xs"
                                onChange={(e) => {
                                  regCreate(`attributes.${index}.label`).onChange(e);
                                  const val = e.target.value;
                                  const generatedKey = val.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_").replace(/\s+/g, "_");
                                  regCreate(`attributes.${index}.key`).onChange({ target: { name: `attributes.${index}.key`, value: generatedKey } });
                                }}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-foreground block mb-1">Input / Display Type</label>
                              <select
                                {...regCreate(`attributes.${index}.type`)}
                                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-ring font-medium"
                              >
                                <option value="multi-select">Multi-Select Pills (Size / Color choices)</option>
                                <option value="select">Dropdown Menu (Single Select)</option>
                                <option value="text">Text Input (Text Field)</option>
                                <option value="number">Number Input (Number Field)</option>
                                <option value="boolean">Checkbox (Yes / No)</option>
                              </select>
                            </div>
                          </div>

                          {needsOptions && (
                            <div>
                              <label className="text-xs font-semibold text-foreground block mb-1">
                                Options List (comma separated)
                              </label>
                              <Input {...regCreate(`attributes.${index}.options`)} placeholder="S, M, L, XL or 4GB, 8GB, 16GB" className="h-9 text-xs" />
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs items-center">
                            <div>
                              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Unit (optional)</label>
                              <Input {...regCreate(`attributes.${index}.unit`)} placeholder="e.g. GB, kg, cm, V" className="h-8 text-xs bg-muted/20" />
                            </div>
                            <div className="sm:col-span-2 flex items-center justify-start sm:justify-end gap-4 pt-2 sm:pt-0">
                              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                                <input type="checkbox" {...regCreate(`attributes.${index}.required`)} className="rounded border-border size-3.5 accent-primary" />
                                <span>Required Field</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 cursor-pointer bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20">
                                <input type="checkbox" {...regCreate(`attributes.${index}.useAsVariant`)} className="rounded border-purple-400 size-3.5 accent-purple-600" />
                                <span>Use as Variant</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Sub Categories</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => createAppend({ name: "", slug: "", categories: [] })}
                    >
                      <Plus className="size-3" data-icon="inline-start" />
                      Add Child
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {createFields.map((field, index) => (
                      <div key={field.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start gap-2">
                          <div className="grid flex-1 grid-cols-2 gap-2">
                            <div>
                              <Input
                                {...regCreate(`children.${index}.name`)}
                                placeholder="Child name"
                                className={errCreate.children?.[index]?.name ? "border-destructive" : ""}
                              />
                              {errCreate.children?.[index]?.name && (
                                <p className="mt-1 text-xs text-destructive">{errCreate.children?.[index]?.name.message}</p>
                              )}
                            </div>
                            <div>
                              <Input
                                {...regCreate(`children.${index}.slug`)}
                                placeholder="child-slug"
                                className={errCreate.children?.[index]?.slug ? "border-destructive" : ""}
                              />
                              {errCreate.children?.[index]?.slug && (
                                <p className="mt-1 text-xs text-destructive">{errCreate.children?.[index]?.slug.message}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-0.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => createRemove(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-lg">
                    {createMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetCreate(); setCreateImage(""); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <FolderTree className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No categories yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const isEditing = editingId === cat._id;
            const isDeleting = deletingId === cat._id;

            return (
              <motion.div
                key={cat._id || cat.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <FolderTree className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2 min-w-[140px]">
                      {!isDeleting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={editingId !== null && !isEditing}
                          onClick={() => isEditing ? (setEditingId(null), resetUpdate()) : startEdit(cat)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}

                      {!isEditing && (
                        <>
                          {!isDeleting ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={editingId !== null}
                              onClick={() => setDeletingId(cat._id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
                              <span className="text-xs text-foreground">Delete?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteMutation.isPending}
                                onClick={() => deleteMutation.mutate(cat._id)}
                              >
                                {deleteMutation.isPending ? "..." : "Yes"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingId(null)}
                              >
                                No
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{cat.children?.length ?? 0} subcategories</span>
                    <span>•</span>
                    <span className="font-medium text-primary">{cat.attributes?.length ?? 0} dynamic attributes</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="border-t border-border px-4 py-4 sm:px-5">
                    <form onSubmit={handleSubmitUpdate(onUpdateSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
                          <Input
                            {...regUpdate("name")}
                            placeholder="Category name"
                            className={errUpdate.name ? "border-destructive" : ""}
                          />
                          {errUpdate.name && <p className="mt-1 text-xs text-destructive">{errUpdate.name.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground">Slug</label>
                          <Input
                            {...regUpdate("slug")}
                            placeholder="category-slug"
                            className={errUpdate.slug ? "border-destructive" : ""}
                          />
                          {errUpdate.slug && <p className="mt-1 text-xs text-destructive">{errUpdate.slug.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Category Image</label>
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
                          {editImage ? (
                            <img src={editImage} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <Upload className="size-8" />
                              <p className="text-sm">Click to upload image</p>
                              <p className="text-xs">PNG, JPG up to 2MB</p>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                        </label>
                        {editImage && (
                          <button
                            type="button"
                            className="mt-1 text-xs text-destructive hover:text-foreground"
                            onClick={() => setEditImage("")}
                          >
                            Remove image
                          </button>
                        )}
                      </div>

                      {/* Edit Category Dynamic Attribute Definitions Section */}
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="space-y-2 border-b border-border/40 pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                              <Sliders className="size-4 text-primary" />
                              Dynamic Category Attribute Builder
                            </h3>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="h-7 text-xs w-full sm:w-auto shrink-0"
                              onClick={() => updateAttrAppend({ key: "", label: "", type: "text", options: "", required: false, unit: "", useAsVariant: false })}
                            >
                              <Plus className="size-3 mr-1" /> Custom Attribute
                            </Button>
                          </div>
                          
                          {/* Quick Add Presets for Saree Store */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Add:</span>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "saree_length", label: "Saree Length (হাত)", type: "select", options: "12 Hands (5.5m), 14 Hands with Blouse Piece (6.3m), 10 Hands, 8 Hands (Kids), 6 Hands (Kids)", required: false, unit: "Hands", useAsVariant: false })}>+ Saree Length</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "fabric", label: "Fabric / Material", type: "select", options: "Jamdani, Katan, Silk, Half Silk, Cotton, Georgette, Muslin, Organza, Tussar Silk", required: false, unit: "", useAsVariant: false })}>+ Fabric</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "blouse_piece", label: "Blouse Piece", type: "select", options: "Included (ব্লাউজ পিস সহ), Not Included (ব্লাউজ পিস ছাড়া), Running Blouse Piece", required: false, unit: "", useAsVariant: false })}>+ Blouse Piece</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "color", label: "Color", type: "multi-select", options: "Red, Maroon, Pink, Blue, Green, Yellow, Black, White, Gold, Purple, Orange, Magenta", required: false, unit: "", useAsVariant: true })}>+ Color</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "width", label: "Width (বহর)", type: "select", options: "42 Inches, 45 Inches, 48 Inches, 50 Inches", required: false, unit: "Inches", useAsVariant: false })}>+ Width / Bahar</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "work_type", label: "Work / Design", type: "select", options: "Handloom (হস্তচালিত), Embroidery, Zari Work, Print, Weaving, Hand Paint", required: false, unit: "", useAsVariant: false })}>+ Work / Design</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "age_range", label: "Age Range", type: "select", options: "2-4 Years, 5-7 Years, 8-10 Years, 11-14 Years, Adult", required: false, unit: "", useAsVariant: false })}>+ Age Range</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "occasion", label: "Occasion", type: "select", options: "Bridal / Wedding, Party Wear, Casual / Daily Wear, Festival / Pohela Boishakh, Traditional", required: false, unit: "", useAsVariant: false })}>+ Occasion</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "wash_care", label: "Wash Care", type: "select", options: "Dry Clean Only, Hand Wash, Machine Wash", required: false, unit: "", useAsVariant: false })}>+ Wash Care</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "stitch_type", label: "Stitch Type", type: "select", options: "Unstitched (সাধারণ শাড়ি), Ready to Wear / Pre-stitched (সেলাই করা রেডিমেড শাড়ি)", required: false, unit: "", useAsVariant: false })}>+ Stitch Type</Button>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 bg-background hover:bg-primary/10" onClick={() => updateAttrAppend({ key: "size", label: "Size", type: "multi-select", options: "XS, S, M, L, XL, XXL, 3XL", required: false, unit: "", useAsVariant: true })}>+ Clothing Size</Button>
                          </div>
                        </div>

                        <div className="space-y-3 pt-1">
                          {updateAttrFields.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg bg-background">
                              No category attributes configured yet.
                            </p>
                          )}

                          {updateAttrFields.map((field, index) => {
                            const currentType = watchUpdate(`attributes.${index}.type`);
                            const isVariant = watchUpdate(`attributes.${index}.useAsVariant`);
                            const needsOptions = currentType === "select" || currentType === "multi-select";
                            return (
                              <div key={field.id} className="relative rounded-xl border border-border/80 bg-background p-3.5 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">#{index + 1}</span>
                                    {isVariant ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                        Option Variant
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                        Product Specification
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateAttrRemove(index)}
                                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                                    title="Remove attribute"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                      Attribute Title / Field Name
                                    </label>
                                    <Input
                                      {...regUpdate(`attributes.${index}.label`)}
                                      placeholder="Size, Material, RAM, etc."
                                      className="h-9 text-xs"
                                      onChange={(e) => {
                                        regUpdate(`attributes.${index}.label`).onChange(e);
                                        const val = e.target.value;
                                        const generatedKey = val.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_").replace(/\s+/g, "_");
                                        regUpdate(`attributes.${index}.key`).onChange({ target: { name: `attributes.${index}.key`, value: generatedKey } });
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">Input / Display Type</label>
                                    <select
                                      {...regUpdate(`attributes.${index}.type`)}
                                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-ring font-medium"
                                    >
                                      <option value="multi-select">Multi-Select Pills (Size / Color choices)</option>
                                      <option value="select">Dropdown Menu (Single Select)</option>
                                      <option value="text">Text Input (Text Field)</option>
                                      <option value="number">Number Input (Number Field)</option>
                                      <option value="boolean">Checkbox (Yes / No)</option>
                                    </select>
                                  </div>
                                </div>

                                {needsOptions && (
                                  <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                      Options List (comma separated)
                                    </label>
                                    <Input {...regUpdate(`attributes.${index}.options`)} placeholder="S, M, L, XL or 4GB, 8GB, 16GB" className="h-9 text-xs" />
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs items-center">
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Unit (optional)</label>
                                    <Input {...regUpdate(`attributes.${index}.unit`)} placeholder="e.g. GB, kg, cm, V" className="h-8 text-xs bg-muted/20" />
                                  </div>
                                  <div className="sm:col-span-2 flex items-center justify-start sm:justify-end gap-4 pt-2 sm:pt-0">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                                      <input type="checkbox" {...regUpdate(`attributes.${index}.required`)} className="rounded border-border size-3.5 accent-primary" />
                                      <span>Required Field</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 cursor-pointer bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20">
                                      <input type="checkbox" {...regUpdate(`attributes.${index}.useAsVariant`)} className="rounded border-purple-400 size-3.5 accent-purple-600" />
                                      <span>Use as Variant</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">Sub Categories</label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateAppend({ name: "", slug: "", categories: [] })}
                          >
                            <Plus className="size-3" data-icon="inline-start" />
                            Add Child
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {updateFields.map((field, index) => (
                            <div key={field.id} className="rounded-lg border border-border p-3">
                              <div className="flex items-start gap-2">
                                <div className="grid flex-1 grid-cols-2 gap-2">
                                  <div>
                                    <Input
                                      {...regUpdate(`children.${index}.name`)}
                                      placeholder="Child name"
                                      className={errUpdate.children?.[index]?.name ? "border-destructive" : ""}
                                    />
                                    {errUpdate.children?.[index]?.name && (
                                      <p className="mt-1 text-xs text-destructive">{errUpdate.children?.[index]?.name.message}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Input
                                      {...regUpdate(`children.${index}.slug`)}
                                      placeholder="child-slug"
                                      className={errUpdate.children?.[index]?.slug ? "border-destructive" : ""}
                                    />
                                    {errUpdate.children?.[index]?.slug && (
                                      <p className="mt-1 text-xs text-destructive">{errUpdate.children?.[index]?.slug.message}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-0.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => updateRemove(index)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={updateMutation.isPending} className="rounded-lg">
                          <Save className="size-4" data-icon="inline-start" />
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setEditingId(null); resetUpdate(); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {!isEditing && cat.children?.length > 0 && (
                  <div className="border-t border-border px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap gap-2">
                      {cat.children.map((child, childIdx) => (
                        <div
                          key={child._id || child.id || `${child.slug}-${childIdx}`}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm"
                        >
                          <ChevronRight className="size-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">{child.name}</span>
                          <span className="text-xs text-muted-foreground">/{child.slug}</span>
                          {child.categories?.length > 0 && (
                            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                              {child.categories.length}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
