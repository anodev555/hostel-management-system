"use client"

import { Button } from "@/components/ui/button"
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogFooter,
} from "@/components/ui/dialog"
import { HandCoins, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  paymentSchema,
  paymentSchemaDefaultValues,
  PaymentSchemaType,
} from "../schema/payment-schema"
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
import { collectPaymentAction } from "../action/billing"
import { toast } from "sonner"
import { router } from "better-auth/api"
import { useRouter } from "next/navigation"

export default function CollectPayment({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const PAYMENT_METHODS = [
    { label: "Cash", value: "cash" },
    { label: "Cheque", value: "cheque" },
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Esewa", value: "esewa" },
    { label: "Khalti", value: "khalti" },
  ]

  const defaultValues = useMemo(
    () => ({
      ...paymentSchemaDefaultValues,
      studentId,
    }),
    [studentId]
  )
  console.log(studentId)
  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultValues,
  })

  async function onSubmit(data: PaymentSchemaType) {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await collectPaymentAction(data)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(defaultValues)
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as keyof PaymentSchemaType, {
                message: errors[0],
              })
            }
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
        <Button>
          <HandCoins />
          Collect Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <div>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <input type="hidden" {...form.register("studentId")} />
            <FieldSet>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="payment-amount">
                        Amount (Rs.)
                      </FieldLabel>
                      <Input
                        id="payment-amount"
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
                      <FieldLabel htmlFor="payment-reference">
                        Reference
                      </FieldLabel>
                      <Input
                        id="payment-reference"
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
                      <FieldLabel htmlFor="payment-received-by">
                        Received by
                      </FieldLabel>
                      <Input
                        id="payment-received-by"
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
                      <FieldLabel htmlFor="payment-notes">
                        Notes (optional)
                      </FieldLabel>
                      <Textarea
                        id="payment-notes"
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
            onClick={() => form.reset(defaultValues)}
          >
            Reset
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
              "Collect Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
