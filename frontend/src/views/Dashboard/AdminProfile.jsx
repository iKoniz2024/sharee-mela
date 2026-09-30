"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Phone, MapPin, Shield, Save, ArrowLeft, Lock } from "lucide-react";
import { updateProfile } from "@/services/user.api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional().or(z.literal("")),
  address: z.string().min(3, "Address must be at least 3 characters").optional().or(z.literal("")),
});

export default function AdminProfile() {
  const { siteName } = useSettings();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res, variables) => {
      toast.success("Profile updated successfully");
      setUser((prev) => ({ ...prev, ...variables }));
      reset(variables);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Helmet>
        <title>Profile | {siteName}</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: User Info & Actions */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center">
            <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold text-foreground">{user?.name || "Admin"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="mt-3 capitalize">
              <Shield className="mr-1.5 size-3" />
              {user?.role || "Administrator"}
            </Badge>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start rounded-xl border-border bg-card"
            onClick={() => router.push("/dashboard/change-password")}
          >
            <Lock className="mr-2 size-4 text-muted-foreground" />
            Change Password
          </Button>
        </div>

        {/* Right Column: Edit Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-foreground border-b border-border pb-3">Edit Profile</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  <User className="mr-1.5 inline size-4 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  {...register("name")}
                  placeholder="Your full name"
                  className={`bg-muted/30 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  <Phone className="mr-1.5 inline size-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input
                  {...register("phone")}
                  placeholder="+880 1XXXXXXXXX"
                  className={`bg-muted/30 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  <MapPin className="mr-1.5 inline size-4 text-muted-foreground" />
                  Address
                </label>
                <Input
                  {...register("address")}
                  placeholder="Your address"
                  className={`bg-muted/30 ${errors.address ? "border-red-500" : ""}`}
                />
                {errors.address && <p className="mt-1.5 text-xs text-red-500">{errors.address.message}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border mt-6">
                <Button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  className="rounded-lg"
                >
                  <Save className="mr-2 size-4" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset()}
                    className="rounded-lg text-muted-foreground"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
