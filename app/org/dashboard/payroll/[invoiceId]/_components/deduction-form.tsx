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
  FieldDescription,
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
import { PayrollDeductionRow } from "@/types/payroll-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MinusCircle, PencilIcon, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  addPayrollDeduction,
  updatePayrollDeduction,
} from "../../action/payroll"
import {
  addPayrollDeductionSchema,
  AddPayrollDeductionSchemaType,
  updatePayrollDeductionSchema,
  UpdatePayrollDeductionSchemaType,
} from "../../schema/payroll-schema"

const DEDUCTION_REASONS = [
  { label: "Advance", value: "advance" },
  { label: "Loan", value: "loan" },
  { label: "Fine", value: "fine" },
  { label: "Other", value: "other" },
]

export default function DeductionForm({
  mode,
  invoiceId,
  deduction,
}: {
  mode: "add" | "edit"
  invoiceId: string
  deduction?: PayrollDeductionRow
}) {
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isAdd = mode === "add"
  const allowed = isAdd
    ? hasPermission("payroll", "create")
    : hasPermission("payroll", "update")

  const defaultValues = useMemo(
    () =>
      isAdd
        ? {
            payrollInvoiceId: invoiceId,
            reason: "other" as AddPayrollDeductionSchemaType["reason"],
            description: "",
            amount: "",
          }
        : {
            deductionId: deduction?.id ?? "",
            reason: (deduction?.reason ?? "other") as UpdatePayrollDeductionSchemaType["reason"],
            description: deduction?.description ?? "",
            amount: deduction?.amount ?? "",
          },
    [isAdd, invoiceId, deduction]
  )

  const form = useForm<
    AddPayrollDeductionSchemaType | UpdatePayrollDeductionSchemaType
  >({
    resolver: zodResolver(
      isAdd ? addPayrollDeductionSchema : updatePayrollDeductionSchema
    ),
    defaultValues: defaultValues as AddPayrollDeductionSchemaType &
      UpdatePayrollDeductionSchemaType,
  })

  async function onSubmit(
    data: AddPayrollDeductionSchemaType | UpdatePayrollDeductionSchemaType
  ) {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = isAdd
        ? await addPayrollDeduction(data as AddPayrollDeductionSchemaType)
        : await updatePayrollDeduction(data as UpdatePayrollDeductionSchemaType)

      if (response.success) {
        setOpen(false)
        toast.success(response.message ?? "Deduction saved")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as "amount" | "reason" | "description", {
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

  const commonName = "amount"
  const commonReason = "reason"

  if (!allowed) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isAdd ? (
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Deduction
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <PencilIcon className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "Add Deduction" : "Edit Deduction"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Apply a deduction to this salary invoice."
              : "Update the deduction details."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            (data) => onSubmit(data),
            () => {}
          )}
        >
          {isAdd ? (
            <input type="hidden" {...form.register("payrollInvoiceId")} />
          ) : (
            <input type="hidden" {...form.register("deductionId")} />
          )}
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name={commonReason}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Reason</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEDUCTION_REASONS.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            <span className="inline-flex items-center gap-2">
                              <MinusCircle className="size-3.5 text-muted-foreground" />
                              {reason.label}
                            </span>
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
                name={commonName}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="deduction-amount">
                      Amount (Rs.)
                    </FieldLabel>
                    <Input
                      id="deduction-amount"
                      inputMode="decimal"
                      placeholder="e.g. 1500.00"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Cannot exceed the remaining gross salary after other
                      deductions.
                    </FieldDescription>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="deduction-description">
                      Description (optional)
                    </FieldLabel>
                    <Textarea
                      id="deduction-description"
                      rows={2}
                      placeholder="e.g. Advance salary taken on 15th"
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
            onClick={() => {
              form.reset(defaultValues)
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="min-w-28 gap-2"
            disabled={isLoading}
            type="button"
            onClick={form.handleSubmit((data) => onSubmit(data), () => {})}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isAdd ? (
              "Add Deduction"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}