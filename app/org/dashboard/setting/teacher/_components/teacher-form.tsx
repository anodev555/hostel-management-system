"use client"

import { Button } from "@/components/ui/button"
import {
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
} from "@/components/ui/dialog"
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { createTeacherAction } from "../action/teacher"
import {
  CreateTeacherSchemaType,
  createTeacherSchema,
  createTeacherDefaultValues,
  teacherStatusValues,
} from "../schema/teacher-schema"

export default function TeacherForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateTeacherSchemaType>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: createTeacherDefaultValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(createTeacherDefaultValues)
    }
  }

  async function onSubmit(values: CreateTeacherSchemaType) {
    setIsLoading(true)
    try {
      const response = await createTeacherAction(values)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(createTeacherDefaultValues)
        return
      }
      toast.error(response.message)
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors?.length) {
            form.setError(name as keyof CreateTeacherSchemaType, {
              message: errors[0],
            })
          }
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create teacher"
      )
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="size-4" />
          Add teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle>Add teacher</DialogTitle>
        <DialogDescription>
          Create a teacher profile. Set payroll when you add a tuition plan for
          them.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Teacher details</FieldLegend>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor="teacher-name">Full name</FieldLabel>
                    <Input
                      id="teacher-name"
                      placeholder="Ram Sharma"
                      disabled={isLoading}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name="monthlySalary"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="teacher-monthly-salary">
                      Monthly salary
                    </FieldLabel>
                    <Input
                      id="teacher-monthly-salary"
                      placeholder="10000"
                      disabled={isLoading}

                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="teacher-phone">Phone</FieldLabel>
                    <Input
                      id="teacher-phone"
                      placeholder="9800000000"
                      disabled={isLoading}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="teacher-email">Email</FieldLabel>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="teacher@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="subject"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor="teacher-subject">Subject</FieldLabel>
                    <Input
                      id="teacher-subject"
                      placeholder="Math, Science"
                      disabled={isLoading}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor="teacher-address">Address</FieldLabel>
                    <Textarea
                      id="teacher-address"
                      placeholder="City, district"
                      disabled={isLoading}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="teacher-status">Status</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="teacher-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherStatusValues.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            onClick={() => form.reset(createTeacherDefaultValues)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create teacher"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
