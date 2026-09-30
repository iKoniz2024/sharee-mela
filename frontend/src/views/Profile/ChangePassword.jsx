"use client";

import { useRouter } from 'next/navigation';

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { changePassword } from "@/services/user.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ChangePassword({ children }) {
  const { siteName } = useSettings();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      reset();
      router.push("/dashboard/profile");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to change password");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ oldPassword: data.oldPassword, newPassword: data.newPassword });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`Change Password | ${siteName}`}</title>
      </Helmet>
      <div className="mx-auto max-w-md">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push(-1)}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Change Password</h1>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
                  Current Password
                </label>
                <Input
                  {...register("oldPassword")}
                  type="password"
                  placeholder="Enter current password"
                  className={errors.oldPassword ? "border-gray-500" : ""}
                />
                {errors.oldPassword && <p className="mt-1 text-xs text-gray-600">{errors.oldPassword.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
                  New Password
                </label>
                <Input
                  {...register("newPassword")}
                  type="password"
                  placeholder="Enter new password"
                  className={errors.newPassword ? "border-gray-500" : ""}
                />
                {errors.newPassword && <p className="mt-1 text-xs text-gray-600">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
                  Confirm New Password
                </label>
                <Input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? "border-gray-500" : ""}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-gray-600">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full rounded-lg" disabled={mutation.isPending}>
                <Save className="size-4" data-icon="inline-start" />
                {mutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
