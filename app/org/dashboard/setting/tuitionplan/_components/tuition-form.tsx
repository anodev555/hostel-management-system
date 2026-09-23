"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { getActiveTeachersAction } from "@/app/org/dashboard/setting/teacher/action/teacher"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ActiveTeacherOption } from "@/types/teacher-types"

import { createTuitionAction } from "../action/tuition"
import {
  createTuitionDefaultValues,
  createTuitionSchema,
  type CreateTuitionSchemaType,
} from "../schema/create-tuition"

export default function TuitionForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<ActiveTeacherOption[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const form = useForm<CreateTuitionSchemaType>({
    resolver: zodResolver(createTuitionSchema),
    defaultValues: createTuitionDefaultValues,
  })

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadTeachers() {
      setLoadingTeachers(true)
      try {
        const response = await getActiveTeachersAction()
        if (cancelled) return
        if (response.success && response.data) {
          setTeachers(response.data)
        } else {
          toast.error(response.message ?? "Failed to load teachers")
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load teachers")
        }
      } finally {
        if (!cancelled) {
          setLoadingTeachers(false)
        }
      }
    }

    void loadTeachers()

    return () => {
      cancelled = true
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(createTuitionDefaultValues)
    }
  }

  async function onSubmit(values: CreateTuitionSchemaType) {
    setIsLoading(true)
    try {
      const response = await createTuitionAction(values)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(createTuitionDefaultValues)
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof CreateTuitionSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create tuition plan"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add tuition plan
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-2xl")}
      >
        <DialogTitle>Add tuition plan</DialogTitle>
        <DialogDescription>
          Create a tuition plan and assign an active teacher.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Plan details</FieldLegend>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor="tuition-name">Plan name</FieldLabel>
                    <Input
                      id="tuition-name"
                      placeholder="Full tuition"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      A short label for this tuition plan.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="monthlyPrice"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="tuition-monthly-price">
                      Student monthly price
                    </FieldLabel>
                    <Input
                      id="tuition-monthly-price"
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
                name="teacherId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="tuition-teacher">Teacher</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || loadingTeachers}
                    >
                      <SelectTrigger id="tuition-teacher">
                        <SelectValue
                          placeholder={
                            loadingTeachers
                              ? "Loading teachers..."
                              : "Select teacher"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.fullName}
                            {teacher.subject ? ` · ${teacher.subject}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!loadingTeachers && teachers.length === 0 ? (
                      <FieldDescription>
                        No active teachers.{" "}
                        <Link
                          href="/org/dashboard/setting/teacher"
                          className="text-primary hover:underline"
                        >
                          Add a teacher
                        </Link>{" "}
                        first.
                      </FieldDescription>
                    ) : null}
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <Button
            type="reset"
            variant="outline"
            disabled={isLoading}
            onClick={() => form.reset(createTuitionDefaultValues)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading || loadingTeachers || teachers.length === 0}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create tuition plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
