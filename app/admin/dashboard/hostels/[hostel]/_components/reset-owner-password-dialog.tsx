"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HostelDetail } from "@/types/hostels-types";

import {
  ownerResetPasswordSchema,
  OwnerResetPasswordSchemaType,
} from "../schema/reset-ownerpassword";
import { ownerResetPasswordAction } from "../action/reset-ownerpassword";

type OwnerResetPasswordDialogProps = {
  owner: NonNullable<HostelDetail["owner"]>;
  hostelId: string;
};

export default function OwnerResetPasswordDialog({
  owner,
  hostelId,
}: OwnerResetPasswordDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OwnerResetPasswordSchemaType>({
    resolver: zodResolver(ownerResetPasswordSchema),
    defaultValues: {
      ownerId: owner.id,
      hostelId,
      password: "",
      confirmPassword: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({ ownerId: owner.id, hostelId, password: "", confirmPassword: "" });
    }
  }

  async function onSubmit(values: OwnerResetPasswordSchemaType) {
    setIsLoading(true);
    try {
      const response = await ownerResetPasswordAction(values);
      if (response.success) {
        toast.success(response.message ?? "Password reset");
        handleOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to reset password");
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof OwnerResetPasswordSchemaType, {
                message: errors[0],
              });
            }
          });
        }
      }
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="mr-2 size-4" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Reset owner password</DialogTitle>
        <DialogDescription>
          Set a new password for {owner.name}. Their active sessions will be
          revoked.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="owner-password">New password</FieldLabel>
                <div className="relative">
                  <Input
                    id="owner-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8–20 characters"
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="owner-confirm">Confirm password</FieldLabel>
                <div className="relative">
                  <Input
                    id="owner-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}