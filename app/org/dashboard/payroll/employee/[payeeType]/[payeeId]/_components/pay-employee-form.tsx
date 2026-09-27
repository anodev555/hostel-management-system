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
import { PayrollPayeeType } from "@/types/payroll-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Banknote, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { collectEmployeePayment } from "../../../../action/payroll"
import {
  collectEmployeePaymentSchema,
  CollectEmployeePaymentSchemaType,
} from "../../../../schema/payroll-schema"

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Esewa", value: "esewa" },
  { label: "Khalti", value: "khalti" },
  { label: "Other", value: "other" },
]

export default function PayEmployeeForm({
  payeeType,
  payeeId,
  payeeName,
  remainingAmount,
}: {
  payeeType: PayrollPayeeType
  payeeId: string
  payeeName: string
  remainingAmount: string
}) {
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo(
    () => ({
      payeeType,
      payeeId,
      amount: remainingAmount,
      method: "cash" as CollectEmployeePaymentSchemaType["method"],
      reference: "",
      notes: "",
      receivedBy: "",
    }),
    [payeeType, payeeId, remainingAmount]
  )

  const form = useForm<CollectEmployeePaymentSchemaType>({
    resolver: zodResolver(collectEmployeePaymentSchema),
    defaultValues,
  })

  async function onSubmit(data: CollectEmployeePaymentSchemaType) {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await collectEmployeePayment(data)
      if (response.success) {
        setOpen(false)
        toast.success(response.message ?? "Salary payout recorded")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof CollectEmployeePaymentSchemaType, {
              type: "manual",
              message: (messages as string[]).join(", "),
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

  if (!hasPermission("payroll", "create")) return null
  if (Number(remainingAmount) <= 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Banknote className="size-4" />
          Pay Salary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Salary</DialogTitle>
          <DialogDescription>
            Record a salary payout for {payeeName}. Oldest unpaid invoices are
            always cleared first.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <input type="hidden" {...form.register("payeeType")} />
          <input type="hidden" {...form.register("payeeId")} />
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="payroll-employee-pay-amount">
                      Amount (Rs.)
                    </FieldLabel>
                    <Input
                      id="payroll-employee-pay-amount"
                      inputMode="decimal"
                      placeholder="e.g. 20000.00"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Total remaining: Rs. {remainingAmount}. Payment splits
                      across oldest dues first.
                    </FieldDescription>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
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
                    <FieldLabel htmlFor="payroll-employee-pay-reference">
                      Reference (optional)
                    </FieldLabel>
                    <Input
                      id="payroll-employee-pay-reference"
                      placeholder="Receipt / txn / cheque no."
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
                    <FieldLabel htmlFor="payroll-employee-pay-received-by">
                      Received by (optional)
                    </FieldLabel>
                    <Input
                      id="payroll-employee-pay-received-by"
                      placeholder="Person who received payment"
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
                    <FieldLabel htmlFor="payroll-employee-pay-notes">
                      Notes (optional)
                    </FieldLabel>
                    <Textarea
                      id="payroll-employee-pay-notes"
                      rows={3}
                      placeholder="Any extra details"
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
            className="min-w-32 gap-2"
            disabled={isLoading}
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Record Payout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
