"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePermissions } from "@/lib/permissions/usePermissions";
import { PayrollDeductionRow } from "@/types/payroll-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updatePayrollDeduction } from "../../../../../action/payroll";
import {
  updatePayrollDeductionSchema,
  type UpdatePayrollDeductionSchemaType,
} from "../../../../../schema/payroll-schema";
import { DeductionFormFields } from "./deduction-form-fields";

export default function EditDeductionForm({
  deduction,
}: {
  deduction: PayrollDeductionRow;
}) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdatePayrollDeductionSchemaType>({
    resolver: zodResolver(updatePayrollDeductionSchema),
    defaultValues: {
      deductionId: deduction.id,
      reason: deduction.reason,
      description: deduction.description ?? "",
      amount: deduction.amount,
    },
  });

  async function onSubmit(data: UpdatePayrollDeductionSchemaType) {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await updatePayrollDeduction(data);
      if (response.success) {
        setOpen(false);
        toast.success(response.message ?? "Deduction updated");
        router.refresh();
      } else {
        toast.error(response.message);
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as "amount" | "reason" | "description", {
              type: "manual",
              message: messages.join(", "),
            });
          });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!hasPermission("payroll", "update")) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Deduction</DialogTitle>
          <DialogDescription>Update the deduction details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, () => {})}>
          <input type="hidden" {...form.register("deductionId")} />
          <DeductionFormFields
            control={form.control}
            idPrefix={`edit-${deduction.id}`}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              form.reset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="min-w-28 gap-2"
            disabled={isLoading}
            type="button"
            onClick={form.handleSubmit(onSubmit, () => {})}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
