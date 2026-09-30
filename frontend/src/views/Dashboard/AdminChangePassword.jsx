"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

export default function AdminChangePassword() {
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
    <div className="mx-auto max-w-xl space-y-6">
      <Helmet>
        <title>Change Password | {siteName}</title>
      </Helmet>

      <div>
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Change Password</h1>
        <p className="text-muted-foreground">Secure your account with a new password.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
              Current Password
            </label>
            <Input
              {...register("oldPassword")}
              type="password"
              placeholder="Enter current password"
              className={`bg-muted/30 ${errors.oldPassword ? "border-red-500" : ""}`}
            />
            {errors.oldPassword && <p className="mt-1.5 text-xs text-red-500">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
              New Password
            </label>
            <Input
              {...register("newPassword")}
              type="password"
              placeholder="Enter new password"
              className={`bg-muted/30 ${errors.newPassword ? "border-red-500" : ""}`}
            />
            {errors.newPassword && <p className="mt-1.5 text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              <Lock className="mr-1.5 inline size-4 text-muted-foreground" />
              Confirm New Password
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm new password"
              className={`bg-muted/30 ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-4 border-t border-border mt-6">
            <Button type="submit" className="w-full rounded-lg" disabled={mutation.isPending}>
              <Save className="mr-2 size-4" />
              {mutation.isPending ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
