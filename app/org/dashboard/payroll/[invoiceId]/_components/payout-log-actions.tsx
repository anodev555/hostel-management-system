"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePermissions } from "@/lib/permissions/usePermissions"
import { PayrollPayoutRow } from "@/types/payroll-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PencilIcon, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  deletePayrollPayout,
  updatePayrollPayout,
} from "../../action/payroll"
import {
  updatePayrollPayoutSchema,
  UpdatePayrollPayoutSchemaType,
} from "../../schema/payroll-schema"
import ConfirmDialog from "./confirm-dialog"

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Esewa", value: "esewa" },
  { label: "Khalti", value: "khalti" },
  { label: "Other", value: "other" },
]

export default function PayoutLogActions({
  payout,
}: {
  payout: PayrollPayoutRow
}) {
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = hasPermission("payroll", "update")
  const canDelete = hasPermission("payroll", "delete")

  if (!canEdit && !canDelete) return null

  const defaultValues = useMemo(
    () => ({
      payoutId: payout.id,
      amount: payout.amount,
      method: payout.method,
      reference: payout.reference ?? "",
      notes: payout.notes ?? "",
      receivedBy: payout.receivedBy ?? "",
    }),
    [payout]
  )

  const form = useForm<UpdatePayrollPayoutSchemaType>({
    resolver: zodResolver(updatePayrollPayoutSchema),
    defaultValues,
  })

  async function handleEdit(data: UpdatePayrollPayoutSchemaType) {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await updatePayrollPayout(data)
      if (response.success) {
        setEditOpen(false)
        toast.success(response.message ?? "Payout updated")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof UpdatePayrollPayoutSchemaType, {
              type: "manual",
              message: messages.join(", "),
            })
          })
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await deletePayrollPayout({ payoutId: payout.id })
      if (response.success) {
        setDeleteOpen(false)
        toast.success(response.message ?? "Payout deleted")
        router.refresh()
      } else {
        toast.error(response.message)
        setDeleteOpen(false)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      setDeleteOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit ? (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PencilIcon className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Payout</DialogTitle>
              <DialogDescription>
                Correct the payout amount or details. The invoice totals will be
                recalculated.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(handleEdit, () => {})}
            >
              <input type="hidden" {...form.register("payoutId")} />
              <FieldSet>
                <FieldGroup>
                  <Controller
                    control={form.control}
                    name="amount"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="payout-edit-amount">
                          Amount (Rs.)
                        </FieldLabel>
                        <Input
                          id="payout-edit-amount"
                          inputMode="decimal"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        {fieldState.error ? (
                          <FieldError>{fieldState.error.message}</FieldError>
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="method"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel>Payment method</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error ? (
                          <FieldError>{fieldState.error.message}</FieldError>
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="reference"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="payout-edit-reference">
                          Reference (optional)
                        </FieldLabel>
                        <Input
                          id="payout-edit-reference"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        {fieldState.error ? (
                          <FieldError>{fieldState.error.message}</FieldError>
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="receivedBy"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="payout-edit-received-by">
                          Received by (optional)
                        </FieldLabel>
                        <Input
                          id="payout-edit-received-by"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        {fieldState.error ? (
                          <FieldError>{fieldState.error.message}</FieldError>
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="notes"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="payout-edit-notes">
                          Notes (optional)
                        </FieldLabel>
                        <Textarea
                          id="payout-edit-notes"
                          rows={2}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        {fieldState.error ? (
                          <FieldError>{fieldState.error.message}</FieldError>
                        ) : null}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="min-w-28 gap-2"
                disabled={isLoading}
                type="button"
                onClick={form.handleSubmit(handleEdit, () => {})}
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
      ) : null}

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
            title="Delete payout?"
            description="This payout will be removed and the invoice totals recalculated. This cannot be undone."
            confirmLabel="Delete"
            isLoading={isLoading}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </div>
  )
}