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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addPayrollDeduction } from "../../../../../action/payroll";
import {
  addPayrollDeductionSchema,
  type AddPayrollDeductionSchemaType,
} from "../../../../../schema/payroll-schema";
import { DeductionFormFields } from "./deduction-form-fields";

export default function AddDeductionForm({ invoiceId }: { invoiceId: string }) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddPayrollDeductionSchemaType>({
    resolver: zodResolver(addPayrollDeductionSchema),
    defaultValues: {
      payrollInvoiceId: invoiceId,
      reason: "other",
      description: "",
      amount: "",
    },
  });

  async function onSubmit(data: AddPayrollDeductionSchemaType) {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await addPayrollDeduction(data);
      if (response.success) {
        setOpen(false);
        form.reset();
        toast.success(response.message ?? "Deduction added");
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

  if (!hasPermission("payroll", "create")) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Deduct
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Deduction</DialogTitle>
          <DialogDescription>
            Apply a deduction to this salary invoice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, () => {})}>
          <input type="hidden" {...form.register("payrollInvoiceId")} />
          <DeductionFormFields
            control={form.control}
            idPrefix={`add-${invoiceId}`}
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
              "Add Deduction"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
