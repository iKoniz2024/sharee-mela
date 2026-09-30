"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Image, Pencil, Save, Upload } from "lucide-react";
import { getBanners, createBanner, updateBanner, deleteBanner } from "@/services/banner.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const bannerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  link: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

import { compressImage } from "@/utils/compressImage";

const toBase64 = (file) => compressImage(file);

export default function AdminBanners({ children }) {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [createImage, setCreateImage] = useState("");
  const [createPreview, setCreatePreview] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const createFileRef = useRef(null);
  const editFileRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: getBanners,
    staleTime: 10 * 60 * 1000,
  });

  const banners = data ?? [];

  const {
    register: regCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errCreate },
    reset: resetCreate,
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "", link: "", isActive: true },
  });

  const {
    register: regUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errUpdate },
    reset: resetUpdate,
  } = useForm({
    resolver: zodResolver(bannerSchema),
  });

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: (res, variables) => {
      toast.success("Banner created");
      queryClient.setQueryData(["admin-banners"], (old) => {
        const newBanner = {
          _id: res?.insertedId || res?._id || Date.now().toString(),
          ...variables,
        };
        return [...(old || []), newBanner];
      });
      queryClient.invalidateQueries();
      setShowForm(false);
      resetCreate();
      setCreateImage("");
      setCreatePreview("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create banner");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateBanner(id, payload),
    onSuccess: (res, variables) => {
      toast.success("Banner updated");
      queryClient.setQueryData(["admin-banners"], (old) => {
        return (old || []).map((b) =>
          b._id === variables.id ? { ...b, ...variables.payload } : b
        );
      });
      queryClient.invalidateQueries();
      setEditingId(null);
      resetUpdate();
      setEditImage("");
      setEditPreview("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update banner");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-banners"] });
      const previousBanners = queryClient.getQueryData(["admin-banners"]);
      queryClient.setQueryData(["admin-banners"], (old) =>
        (old || []).filter((b) => b._id !== deletedId)
      );
      return { previousBanners };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(["admin-banners"], context.previousBanners);
      }
      toast.error(err?.response?.data?.message || "Failed to delete banner");
    },
    onSuccess: () => {
      toast.success("Banner deleted");
      setDeletingId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const handleCreateImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setCreateImage(base64);
      setCreatePreview(URL.createObjectURL(file));
    } catch {
      toast.error("Failed to read image");
    }
    e.target.value = "";
  };

  const handleEditImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setEditImage(base64);
      setEditPreview(URL.createObjectURL(file));
    } catch {
      toast.error("Failed to read image");
    }
    e.target.value = "";
  };

  const onCreateSubmit = (formData) => {
    if (!createImage) {
      toast.error("Please upload an image");
      return;
    }
    createMutation.mutate({
      title: formData.title,
      image: createImage,
      link: formData.link || "",
      isActive: formData.isActive ?? true,
    });
  };

  const onUpdateSubmit = (formData) => {
    if (!editImage) {
      toast.error("Please upload an image");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      payload: {
        title: formData.title,
        image: editImage,
        link: formData.link || "",
        isActive: formData.isActive ?? true,
      },
    });
  };

  const startEdit = (banner) => {
    setEditingId(banner._id);
    setEditImage(banner.image || banner.images?.[0] || "");
    setEditPreview(banner.image || banner.images?.[0] || "");
    resetUpdate({
      title: banner.title,
      link: banner.link || "",
      isActive: banner.isActive ?? true,
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Banners | ${siteName}`}</title>
      </Helmet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Banners ({banners.length})
        </h1>
        <Button onClick={() => setShowForm(true)} className="self-start">
          <Plus className="size-4" data-icon="inline-start" />
          Add Banner
        </Button>
      </div>

      {/* Create Modal */}
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
              className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="size-4" />
              </button>

              <h2 className="mb-6 text-lg font-semibold text-foreground">Add New Banner</h2>

              <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
                  <Input
                    {...regCreate("title")}
                    placeholder="e.g. Summer Sale"
                    className={errCreate.title ? "border-destructive" : ""}
                  />
                  {errCreate.title && <p className="mt-1 text-xs text-destructive">{errCreate.title.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Link</label>
                  <Input {...regCreate("link")} placeholder="e.g. /products" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Banner Image * <span className="text-xs text-muted-foreground font-normal">(Recommended Ratio: 3:1 Banner / 1200x400px)</span>
                  </label>
                  <input
                    ref={createFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCreateImage}
                  />
                  <button
                    type="button"
                    onClick={() => createFileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <Upload className="size-5" />
                    Click to upload banner image (Recommended 3:1 Ratio)
                  </button>
                  {createPreview && (
                    <div className="mt-3 relative inline-block">
                      <img src={createPreview} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
                      <button
                        type="button"
                        onClick={() => { setCreateImage(""); setCreatePreview(""); }}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-lg">
                    {createMutation.isPending ? "Creating..." : "Create Banner"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetCreate(); setCreateImage(""); setCreatePreview(""); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <Image className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No banners yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, i) => {
            const isEditing = editingId === banner._id;
            const isDeleting = deletingId === banner._id;

            return (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Image className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{banner.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {banner.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                      {!isDeleting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={editingId !== null && !isEditing}
                          onClick={() => isEditing ? (setEditingId(null), resetUpdate(), setEditImage(""), setEditPreview("")) : startEdit(banner)}
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
                              className="text-muted-foreground hover:bg-muted hover:text-foreground"
                              disabled={editingId !== null}
                              onClick={() => setDeletingId(banner._id)}
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
                                onClick={() => deleteMutation.mutate(banner._id)}
                              >
                                {deleteMutation.isPending ? "..." : "Yes"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                                No
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing && (banner.image || banner.images?.length > 0) && (
                    <div className="mt-3 pl-12">
                      <img
                        src={banner.image || banner.images?.[0]}
                        alt={banner.title}
                        className="h-20 w-40 rounded-lg border border-border object-cover"
                      />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="border-t border-border px-4 py-4 sm:px-5">
                    <form onSubmit={handleSubmitUpdate(onUpdateSubmit)} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
                        <Input
                          {...regUpdate("title")}
                          placeholder="Banner title"
                          className={errUpdate.title ? "border-destructive" : ""}
                        />
                        {errUpdate.title && <p className="mt-1 text-xs text-destructive">{errUpdate.title.message}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Link</label>
                        <Input {...regUpdate("link")} placeholder="/products" />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Image *</label>
                        <input
                          ref={editFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditImage}
                        />
                        <button
                          type="button"
                          onClick={() => editFileRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
                        >
                          <Upload className="size-5" />
                          Click to change image
                        </button>
                        {editPreview && (
                          <div className="mt-3 relative inline-block">
                            <img src={editPreview} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
                            <button
                              type="button"
                              onClick={() => { setEditImage(""); setEditPreview(""); }}
                              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={updateMutation.isPending} className="rounded-lg">
                          <Save className="size-4" data-icon="inline-start" />
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setEditingId(null); resetUpdate(); setEditImage(""); setEditPreview(""); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
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
