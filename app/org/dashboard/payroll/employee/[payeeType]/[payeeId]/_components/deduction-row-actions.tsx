"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/permissions/usePermissions";
import { PayrollDeductionRow } from "@/types/payroll-types";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deletePayrollDeduction } from "../../../../action/payroll";
import ConfirmDialog from "./confirm-dialog";
import EditDeductionForm from "./deduction/edit-deduction-form";

export default function DeductionRowActions({
  invoiceId,
  deduction,
}: {
  invoiceId: string;
  deduction: PayrollDeductionRow;
}) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = hasPermission("payroll", "update");
  const canDelete = hasPermission("payroll", "delete");

  if (!canEdit && !canDelete) return null;

  async function handleDelete() {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const response = await deletePayrollDeduction({
        deductionId: deduction.id,
      });
      if (response.success) {
        setDeleteOpen(false);
        toast.success(response.message ?? "Deduction removed");
        router.refresh();
      } else {
        toast.error(response.message);
        setDeleteOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit ? <EditDeductionForm deduction={deduction} /> : null}
      {canDelete ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Remove deduction?"
            description="This deduction will be removed and the net salary recalculated. This cannot be undone."
            confirmLabel="Remove"
            isLoading={isDeleting}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </div>
  );
}
