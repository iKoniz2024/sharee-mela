"use client";

import { useRouter } from 'next/navigation';

import { useMutation} from "@tanstack/react-query";
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

import usePageTitle from "@/hooks/usePageTitle";

export default function Profile({ children }) {
  const { siteName } = useSettings();
  usePageTitle("My Profile");
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
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Helmet><title>{`Profile | ${siteName}`}</title></Helmet>
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push(-1)}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Profile</h1>

          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 text-xs capitalize">
                  <Shield className="size-3" data-icon="inline-start" />
                  {user?.role || "user"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-foreground">Edit Profile</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <User className="mr-1.5 inline size-4 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  {...register("name")}
                  placeholder="Your name"
                  className={errors.name ? "border-gray-500" : ""}
                />
                {errors.name && <p className="mt-1 text-xs text-gray-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Phone className="mr-1.5 inline size-4 text-muted-foreground" />
                  Phone
                </label>
                <Input
                  {...register("phone")}
                  placeholder="+880 1XXXXXXXXX"
                  className={errors.phone ? "border-gray-500" : ""}
                />
                {errors.phone && <p className="mt-1 text-xs text-gray-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <MapPin className="mr-1.5 inline size-4 text-muted-foreground" />
                  Address
                </label>
                <Input
                  {...register("address")}
                  placeholder="Your address"
                  className={errors.address ? "border-gray-500" : ""}
                />
                {errors.address && <p className="mt-1 text-xs text-gray-600">{errors.address.message}</p>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  className="rounded-lg"
                >
                  <Save className="size-4" data-icon="inline-start" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset()}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          <Button
            variant="ghost"
            className="mt-4 w-full justify-start"
            onClick={() => router.push("/dashboard/change-password")}
          >
            <Lock className="size-4" data-icon="inline-start" />
            Change Password
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
