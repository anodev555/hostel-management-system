"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, TrashIcon, UtensilsCrossed } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"
import type { FoodPlan } from "@/types/food-types"

import { deleteFoodingAction, updateFoodingAction } from "../../action/fooding"
import {
  editFoodingSchema,
  type EditFoodingSchemaType,
} from "../../schema/create-fooding"

function foodPlanToFormValues(foodPlan: FoodPlan): EditFoodingSchemaType {
  return {
    foodPlanId: foodPlan.id,
    name: foodPlan.name,
    monthlyPrice: foodPlan.monthlyPrice,
    status: foodPlan.status === "inactive" ? "inactive" : "active",
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

export default function FoodingEditForm({ foodPlan }: { foodPlan: FoodPlan }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo(
    () => foodPlanToFormValues(foodPlan),
    [foodPlan]
  )

  const form = useForm<EditFoodingSchemaType>({
    resolver: zodResolver(editFoodingSchema),
    defaultValues,
  })

  const { isDirty } = form.formState

  async function onSubmit(values: EditFoodingSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateFoodingAction(values)
      if (response.success) {
        form.reset(values)
        toast.success(response.message ?? "Food plan updated successfully")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof EditFoodingSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update food plan"
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
        onClick={() => router.push("/org/dashboard/setting/fooding")}
      >
        <ArrowLeft className="size-4" />
        Fooding
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="size-5" />
                {foodPlan.name}
              </CardTitle>
              <CardDescription>
                Update food plan details. Created by{" "}
                {foodPlan.createdByName ?? "—"} on{" "}
                {formatDate(foodPlan.createdAt)}.
              </CardDescription>
            </div>
            <DeleteFoodingDialog foodPlanId={foodPlan.id} />
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
                      <FieldLabel htmlFor="edit-fooding-name">
                        Plan name
                      </FieldLabel>
                      <Input
                        id="edit-fooding-name"
                        placeholder="Standard Meals"
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
                      <FieldLabel htmlFor="edit-fooding-monthly-price">
                        Monthly price
                      </FieldLabel>
                      <Input
                        id="edit-fooding-monthly-price"
                        inputMode="decimal"
                        placeholder="5000.00"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Default monthly food charge for students on this plan.
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
                        <FieldLabel htmlFor="edit-fooding-status">
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
                                ? "This plan can be assigned to students."
                                : "Inactive plans are hidden from new student assignments."}
                            </p>
                          </div>
                          <Checkbox
                            id="edit-fooding-status"
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
        dialogTitle="Update food plan?"
        dialogDescription="Changes will apply to this plan. Existing student assignments keep their saved food amount until reassigned."
        confirmLabel="Confirm update"
        cancelLabel="Cancel"
      />
    </div>
  )
}

function DeleteFoodingDialog({ foodPlanId }: { foodPlanId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await deleteFoodingAction({ foodPlanId })

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message ?? "Food plan deleted successfully")
      setIsOpen(false)
      router.push("/org/dashboard/setting/fooding")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete food plan"
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
          <DialogTitle>Delete food plan</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Plans assigned to students cannot be
            deleted until those assignments are released.
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
