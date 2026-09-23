"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, GraduationCap, Loader2, TrashIcon } from "lucide-react"
import Link from "next/link"
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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"
import type { TuitionPlanDetail } from "@/types/tuition-types"

import { deleteTuitionAction, updateTuitionAction } from "../../action/tuition"
import {
  editTuitionSchema,
  type EditTuitionSchemaType,
} from "../../schema/create-tuition"

function tuitionPlanToFormValues(
  tuitionPlan: TuitionPlanDetail
): EditTuitionSchemaType {
  return {
    tuitionPlanId: tuitionPlan.id,
    teacherId: tuitionPlan.teacherId,
    name: tuitionPlan.name,
    monthlyPrice: tuitionPlan.monthlyPrice,
    status: tuitionPlan.status === "inactive" ? "inactive" : "active",
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

export default function TuitionEditForm({
  tuitionPlan,
}: {
  tuitionPlan: TuitionPlanDetail
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo(
    () => tuitionPlanToFormValues(tuitionPlan),
    [tuitionPlan]
  )

  const form = useForm<EditTuitionSchemaType>({
    resolver: zodResolver(editTuitionSchema),
    defaultValues,
  })

  const { isDirty } = form.formState

  async function onSubmit(values: EditTuitionSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateTuitionAction(values)
      if (response.success) {
        form.reset(values)
        toast.success(response.message ?? "Tuition plan updated successfully")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof EditTuitionSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update tuition plan"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    form.reset(defaultValues)
  }

  return (
    <div className="space-y-6 pb-24">
      <Button
        type="button"
        variant="ghost"
        className="-ml-2"
        onClick={() => router.push("/org/dashboard/setting/tuitionplan")}
      >
        <ArrowLeft className="size-4" />
        Tuition plans
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5" />
                {tuitionPlan.name}
              </CardTitle>
              <CardDescription>
                Update plan details. Created by{" "}
                {tuitionPlan.createdByName ?? "—"} on{" "}
                {formatDate(tuitionPlan.createdAt)}.
              </CardDescription>
            </div>
            <DeleteTuitionDialog tuitionPlanId={tuitionPlan.id} />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldLegend>Plan details</FieldLegend>
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-tuition-name">
                        Plan name
                      </FieldLabel>
                      <Input
                        id="edit-tuition-name"
                        placeholder="Full tuition"
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
                      <FieldLabel htmlFor="edit-tuition-monthly-price">
                        Student monthly price
                      </FieldLabel>
                      <Input
                        id="edit-tuition-monthly-price"
                        inputMode="decimal"
                        placeholder="3000.00"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Extra monthly charge for students on this plan.
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
                        <FieldLabel htmlFor="edit-tuition-status">
                          Plan status
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
                                : "Inactive plans are hidden from new assignments."}
                            </p>
                          </div>
                          <Checkbox
                            id="edit-tuition-status"
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

            <FieldSet className="mt-6">
              <FieldLegend>Teacher</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel>Assigned teacher</FieldLabel>
                  <div className="rounded-lg border px-3 py-3 text-sm">
                    <Link
                      href={`/org/dashboard/setting/teacher/${tuitionPlan.teacherId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {tuitionPlan.teacherName}
                    </Link>
                    {tuitionPlan.teacherSubject ? (
                      <p className="text-muted-foreground">
                        {tuitionPlan.teacherSubject}
                        {tuitionPlan.teacherPhone
                          ? ` · ${tuitionPlan.teacherPhone}`
                          : ""}
                      </p>
                    ) : null}
                    <FieldDescription className="mt-1">
                      Edit teacher profile from the teacher settings page.
                    </FieldDescription>
                  </div>
                </Field>
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
        dialogTitle="Update tuition plan?"
        dialogDescription="Changes apply to this plan. Active student assignments are updated when the monthly price changes."
        confirmLabel="Confirm update"
        cancelLabel="Cancel"
      />
    </div>
  )
}

function DeleteTuitionDialog({ tuitionPlanId }: { tuitionPlanId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await deleteTuitionAction({ tuitionPlanId })

      if (!response.success) {
        toast.error(response.message)
        return
      }

      toast.success(response.message ?? "Tuition plan deleted successfully")
      setIsOpen(false)
      router.push("/org/dashboard/setting/tuitionplan")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete tuition plan"
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
          <DialogTitle>Delete tuition plan</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The linked teacher profile will be
            kept; only this plan is removed.
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
