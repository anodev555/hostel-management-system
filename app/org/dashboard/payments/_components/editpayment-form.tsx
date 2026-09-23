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
import { PencilIcon, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { PaymentHistoryRow } from "@/types/payment-type"
import {
  editPaymentSchema,
  EditPaymentSchemaType,
} from "../schema/editpayment-schema"
import { updatePaymentAction } from "../action/payment"
import { toast } from "sonner"

export default function EditPaymentForm({
  payment,
  student,
}: {
  payment: PaymentHistoryRow
  student: string
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const PAYMENT_METHODS = [
    { label: "Cash", value: "cash" },
    { label: "Cheque", value: "cheque" },
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Esewa", value: "esewa" },
    { label: "Khalti", value: "khalti" },
  ]

  const defaultValues = useMemo(
    () => ({
      studentId: student,
      invoiceId: payment.invoiceId,
      paymentId: payment.id,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference ?? "",
      notes: payment.notes ?? "",
      recievedBy: payment.receivedBy ?? "",
    }),
    [student, payment]
  )

  const form = useForm<EditPaymentSchemaType>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues,
  })

  async function onSubmit(data: EditPaymentSchemaType) {
    if (isLoading) return

    try {
      setIsLoading(true)
      const response = await updatePaymentAction(data)
      if (response.success) {
        setOpen(false)
        toast.success(`${response.message}`)
      } else {
        toast.error(`${response.message}`)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof EditPaymentSchemaType, {
              type: "manual",
              message: messages.join(", "),
            })
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>Edit the payment details</DialogDescription>
        </DialogHeader>

        <div>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <input type="hidden" {...form.register("studentId")} />
            <input type="hidden" {...form.register("invoiceId")} />
            <input type="hidden" {...form.register("paymentId")} />
            <FieldSet>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-payment-amount">
                        Amount (Rs.)
                      </FieldLabel>
                      <Input
                        id="edit-payment-amount"
                        type="text"
                        placeholder="e.g. 5000"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Amount received from the student or guardian.
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                      <FieldLabel htmlFor="edit-payment-reference">
                        Reference
                      </FieldLabel>
                      <Input
                        id="edit-payment-reference"
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
                  name="recievedBy"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-payment-received-by">
                        Received by
                      </FieldLabel>
                      <Input
                        id="edit-payment-received-by"
                        placeholder="Staff name"
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
                      <FieldLabel htmlFor="edit-payment-notes">
                        Notes (optional)
                      </FieldLabel>
                      <Textarea
                        id="edit-payment-notes"
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
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              form.reset(defaultValues);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex w-30 items-center justify-center gap-2"
            disabled={isLoading}
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
