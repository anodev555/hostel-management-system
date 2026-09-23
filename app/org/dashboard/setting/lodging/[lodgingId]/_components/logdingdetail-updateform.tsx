"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Building2, Loader2, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormSaveBar } from "@/app/org/dashboard/_components/form-save-bar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { LodgingItem } from "@/types/lodging-types"

import { deleteLodgingAction, updateLodgingAction } from "../../action/lodging"
import {
  editLodgingSchema,
  type EditLodgingSchemaType,
} from "../../schema/lodging-schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function lodgingToFormValues(lodging: LodgingItem): EditLodgingSchemaType {
  return {
    lodgingId: lodging.id,
    name: lodging.name,
    monthlyPrice: lodging.monthlyPrice,
    status: lodging.status === "inactive" ? "inactive" : "active",
  }
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function LodgingDetailUpdateForm({
  lodging,
}: {
  lodging: LodgingItem
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo(() => lodgingToFormValues(lodging), [lodging])

  const form = useForm<EditLodgingSchemaType>({
    resolver: zodResolver(editLodgingSchema),
    defaultValues,
  })

  const { isDirty } = form.formState

  async function onSubmit(values: EditLodgingSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateLodgingAction(values)
      if (response.success) {
        form.reset(values)
        toast.success(response.message ?? "Lodging plan updated successfully")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof EditLodgingSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update lodging plan"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    form.reset(defaultValues)
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-24">
      <Button
        type="button"
        variant="ghost"
        className="-ml-2"
        onClick={() => router.push("/org/dashboard/setting/lodging")}
      >
        <ArrowLeft className="size-4" />
        Lodging
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                {lodging.name}
              </CardTitle>
              <CardDescription>
                Update lodging plan details. Created by{" "}
                {lodging.createdByName ?? "—"} on{" "}
                {formatDate(lodging.createdAt)}.
              </CardDescription>
            </div>
            <div>
              <DeleteLodgingDialog lodgingId={lodging.id} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup className="grid gap-4">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-lodging-name">
                        Plan name
                      </FieldLabel>
                      <Input
                        id="edit-lodging-name"
                        placeholder="AC Double"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="monthlyPrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-lodging-monthly-price">
                        Monthly price
                      </FieldLabel>
                      <Input
                        id="edit-lodging-monthly-price"
                        inputMode="decimal"
                        placeholder="8000.00"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Default monthly lodging charge for rooms on this plan.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="status"
                  render={({ field, fieldState }) => {
                    const isActive = field.value === "active"

                    return (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="edit-lodging-status">
                          Status
                        </FieldLabel>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                            isActive && "border-primary bg-primary/5",
                            isLoading && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {isActive ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isActive
                                ? "This plan can be assigned to rooms."
                                : "Inactive plans are hidden from new room assignments."}
                            </p>
                          </div>
                          <Checkbox
                            id="edit-lodging-status"
                            disabled={isLoading}
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked === true ? "active" : "inactive"
                              )
                            }
                          />
                        </label>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>

      <FormSaveBar
        isDirty={isDirty}
        isLoading={isLoading}
        onReset={handleReset}
        onConfirm={form.handleSubmit(onSubmit)}
        message="Unsaved changes"
        resetLabel="Reset"
        saveLabel="Save changes"
        dialogTitle="Update lodging plan?"
        dialogDescription="Changes will apply to this plan. Existing room assignments keep their saved lodging amount until reassigned."
        confirmLabel="Confirm update"
        cancelLabel="Cancel"
      />
    </div>
  )
}

function DeleteLodgingDialog({ lodgingId }: { lodgingId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await deleteLodgingAction({ lodgingId })

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message ?? "Lodging plan deleted successfully")
      setIsOpen(false)
      router.push("/org/dashboard/setting/lodging")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete lodging plan"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete lodging plan</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Plans assigned to rooms cannot be
            deleted until those rooms are reassigned or removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
