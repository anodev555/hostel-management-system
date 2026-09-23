"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, GraduationCap, Loader2, TrashIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormSaveBar } from "@/app/org/dashboard/_components/form-save-bar"
import { formatRupee } from "@/app/org/dashboard/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { TeacherDetail } from "@/types/teacher-types"

import {
  deleteTeacherAction,
  updateTeacherAction,
} from "../action/teacher-updatedelete"
import {
  editTeacherSchema,
  teacherStatusValues,
  type EditTeacherSchemaType,
} from "../../schema/teacher-schema"

function teacherToFormValues(teacher: TeacherDetail): EditTeacherSchemaType {
  return {
    teacherId: teacher.id,
    fullName: teacher.fullName,
    phone: teacher.phone ?? "",
    email: teacher.email ?? "",
    subject: teacher.subject ?? "",
    address: teacher.address ?? "",
    monthlySalary: teacher.monthlySalary ?? "",
    status: teacher.status === "inactive" ? "inactive" : "active",
  }
}

export default function EditTeacherForm({
  teacher,
}: {
  teacher: TeacherDetail
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo(() => teacherToFormValues(teacher), [teacher])

  const form = useForm<EditTeacherSchemaType>({
    resolver: zodResolver(editTeacherSchema),
    defaultValues,
  })

  const { isDirty } = form.formState

  async function onSubmit(values: EditTeacherSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateTeacherAction(values)
      if (response.success) {
        toast.success(response.message)
        form.reset(values)
        router.refresh()
        return
      }
      toast.error(response.message)
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors?.length) {
            form.setError(name as keyof EditTeacherSchemaType, {
              message: errors[0],
            })
          }
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update teacher"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => router.push("/org/dashboard/setting/teacher")}
      >
        <ArrowLeft className="size-4" />
        Back to teachers
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              {teacher.fullName}
            </CardTitle>
            <CardDescription>
              Update teacher profile. Payroll is set per tuition plan.
            </CardDescription>
          </div>
          <DeleteTeacherDialog
            teacherId={teacher.id}
            teacherName={teacher.fullName}
          />
        </CardHeader>
        <CardContent>
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
                      <FieldLabel htmlFor="edit-teacher-name">
                        Full name
                      </FieldLabel>
                      <Input
                        id="edit-teacher-name"
                        disabled={isLoading}
                        {...field}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="monthlySalary"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-teacher-monthly-salary">
                        Monthly salary
                      </FieldLabel>
                      <Input
                        id="edit-teacher-monthly-salary"
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
                      <FieldLabel htmlFor="edit-teacher-phone">
                        Phone
                      </FieldLabel>
                      <Input
                        id="edit-teacher-phone"
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
                      <FieldLabel htmlFor="edit-teacher-email">
                        Email
                      </FieldLabel>
                      <Input
                        id="edit-teacher-email"
                        type="email"
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
                      <FieldLabel htmlFor="edit-teacher-subject">
                        Subject
                      </FieldLabel>
                      <Input
                        id="edit-teacher-subject"
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
                      <FieldLabel htmlFor="edit-teacher-address">
                        Address
                      </FieldLabel>
                      <Textarea
                        id="edit-teacher-address"
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
                      <FieldLabel htmlFor="edit-teacher-status">
                        Status
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="edit-teacher-status">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tuition plans & payroll</CardTitle>
          <CardDescription>
            Each plan has its own student price and teacher payroll contract.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacher.plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Pay type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Effective from</TableHead>
                  <TableHead>Contract</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacher.plans.map((plan) => (
                  <TableRow key={plan.planId}>
                    <TableCell>
                      <Link
                        href={`/org/dashboard/setting/tuitionplan/${plan.planId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {plan.planName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {plan.payeeType === "per_active_student"
                        ? "Per student"
                        : "Monthly"}
                    </TableCell>

                    <TableCell>{plan.effectiveFrom || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.contractStatus}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No tuition plans yet.{" "}
              <Link
                href="/org/dashboard/setting/tuitionplan"
                className="text-primary hover:underline"
              >
                Create a plan
              </Link>{" "}
              and assign this teacher.
            </p>
          )}
        </CardContent>
      </Card>

      <FormSaveBar
        isDirty={isDirty}
        isLoading={isLoading}
        onReset={() => form.reset(defaultValues)}
        onConfirm={() => form.handleSubmit(onSubmit)()}
        dialogTitle="Update teacher?"
        dialogDescription="Save changes to this teacher profile."
        confirmLabel="Save changes"
      />
    </div>
  )
}

function DeleteTeacherDialog({
  teacherId,
  teacherName,
}: {
  teacherId: string
  teacherName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    try {
      const response = await deleteTeacherAction({ teacherId })
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        router.push("/org/dashboard/setting/teacher")
        return
      }
      toast.error(response.message)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete teacher"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <TrashIcon className="size-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete teacher</DialogTitle>
          <DialogDescription>
            Delete {teacherName}? This only works if they have no tuition plans.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
