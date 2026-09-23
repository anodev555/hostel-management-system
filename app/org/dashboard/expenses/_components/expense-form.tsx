"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageIcon, Loader2, PlusIcon, TrashIcon } from "lucide-react"
import {
  BILL_PHOTO_ACCEPT,
  BILL_PHOTO_MAX_SIZE_BYTES,
  createExpenseDefaultValues,
  createExpenseSchema,
  CreateExpenseSchemaType,
} from "../schema/expenseSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Control,
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ExpenseCategory,
  ExpensePaymentMethod,
} from "@/db/schema/expenses-schema"
import { Textarea } from "@/components/ui/textarea"
import { createExpensesAction } from "../action/expenses"
import { toast } from "sonner"

function ExpenseLineTotal({
  index,
  control,
}: {
  index: number
  control: Control<CreateExpenseSchemaType>
}) {
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` })

  const total =
    quantity && unitPrice
      ? (Math.round(Number(quantity) * Number(unitPrice) * 100) / 100).toFixed(
          2
        )
      : "0.00"

  return (
    <Field>
      <FieldLabel>Total</FieldLabel>
      <Input value={total} readOnly disabled />
    </Field>
  )
}

export default function ExpenseForm() {
  const [open, setOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<CreateExpenseSchemaType>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: createExpenseDefaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchItems = useWatch({
    control: form.control,
    name: "items",
  })
  const grandTotal = useMemo(() => {
    const total = (watchItems ?? []).reduce((sum, item) => {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      if (isNaN(quantity) || isNaN(unitPrice)) return sum
      return sum + Math.round(quantity * unitPrice * 100) / 100
    }, 0)
    return total.toFixed(2)
  }, [watchItems])

  const billPhoto = useWatch({ control: form.control, name: "billPhoto" })
  const billPhotoInputRef = useRef<HTMLInputElement>(null)
  const [billPhotoUrl, setBillPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!billPhoto) {
      setBillPhotoUrl(null)
      return
    }

    const url = URL.createObjectURL(billPhoto)
    setBillPhotoUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [billPhoto])

  async function onSubmit(data: CreateExpenseSchemaType) {
    const items = data.items.map((item) => ({
      ...item,
      amount: (
        Math.round(Number(item.quantity) * Number(item.unitPrice) * 100) / 100
      ).toFixed(2),
    }))
    const payload = {
      ...data,
      items,
    }
    try {
      setIsLoading(true)

      const result = await createExpensesAction(payload)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        form.reset()
      } else {
        toast.error(result.message)
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof CreateExpenseSchemaType, {
                message: errors.join(", "),
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
        <Button variant="default">
          <PlusIcon className="h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Controller
                control={form.control}
                name="expenseDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Date</FieldLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-full justify-start font-normal"
                        >
                          {field.value
                            ? format(field.value, "yyyy-MM-dd")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value ? field.value : undefined}
                          defaultMonth={field.value ? field.value : undefined}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(date)
                            setDateOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.value ?? "Select category"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ExpenseCategory.enumValues).map(
                          (category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="billNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>
                      Bill number{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <Input {...field} placeholder="Bill number" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Payment method</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.value ?? "Select payment method"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ExpensePaymentMethod.enumValues).map(
                          (item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="paidTo"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>
                      Paid to{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Paid to"
                      aria-invalid={!!fieldState.error}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="paidBy"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Paid by</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Paid by"
                      aria-invalid={!!fieldState.error}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="remarks"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>
                      Remarks{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      placeholder="Remarks"
                      aria-invalid={!!fieldState.error}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="billPhoto"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-3"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel>
                      Bill photo{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="flex h-32 w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {billPhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={billPhotoUrl}
                            alt="Bill preview"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <ImageIcon className="size-7" />
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <Input
                          ref={billPhotoInputRef}
                          type="file"
                          accept={BILL_PHOTO_ACCEPT.join(",")}
                          aria-invalid={!!fieldState.error}
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file ?? undefined)
                          }}
                        />
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {field.value.name}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange(undefined)
                                if (billPhotoInputRef.current) {
                                  billPhotoInputRef.current.value = ""
                                }
                              }}
                            >
                              <TrashIcon className="size-4" />
                              Remove
                            </Button>
                          </div>
                        ) : null}
                        <FieldDescription>
                          JPG, JPEG, or PNG. Max{" "}
                          {Math.round(
                            BILL_PHOTO_MAX_SIZE_BYTES / (1024 * 1024)
                          )}
                          MB.
                        </FieldDescription>
                      </div>
                    </div>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Button
                variant="outline"

                type="button"
                onClick={() =>
                  append({
                    itemName: "",
                    quantity: "",
                    unitPrice: "",
                    amount: undefined,
                  })
                }
              >
                <PlusIcon className="h-4 w-4" /> Add Item
              </Button>
              <FieldGroup className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Controller
                      control={form.control}
                      name={`items.${index}.itemName`}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel>Name</FieldLabel>
                          <Input {...field} />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel>Qty</FieldLabel>
                          <Input inputMode="decimal" {...field} />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel>Unit price</FieldLabel>
                          <Input inputMode="decimal" {...field} />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                    <ExpenseLineTotal index={index} control={form.control} />{" "}
                    <Button
                      size="icon"
                      variant="destructive"
                      type="button"
                      className="mt-6"
                      onClick={() => remove(index)}
                    >
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Field>
                  <FieldLabel>Grand Total</FieldLabel>
                  <Input value={grandTotal} readOnly />
                </Field>
              </FieldGroup>
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex w-30 items-center gap-2"
            disabled={isLoading}
            type="button"
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
