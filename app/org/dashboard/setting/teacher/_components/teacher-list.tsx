"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PencilIcon, Plus, UserRound } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { PaginationControls } from "@/components/pagination-controls"
import { SearchBar } from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
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
import type { GetTeachersResponse } from "@/types/teacher-types"

import { createTeacherAction } from "../action/teacher"
import {
  createTeacherDefaultValues,
  createTeacherSchema,
  teacherStatusValues,
  type CreateTeacherSchemaType,
} from "../schema/teacher-schema"
import TeacherForm from "./teacher-form"

export default function TeacherList({ data }: { data: GetTeachersResponse }) {
  const searchParams = useSearchParams()
  const search = searchParams.get("search")
  const { teachers, totalPages } = data

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tuition teachers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage teachers, then assign them to tuition plans with payroll
            rates.
          </p>
        </div>

        {/* <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="size-4" />
              Add teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogTitle>Add teacher</DialogTitle>
            <DialogDescription>
              Create a teacher profile. Set payroll when you add a tuition plan
              for them.
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
                        <FieldLabel htmlFor="teacher-name">
                          Full name
                        </FieldLabel>
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
                        <FieldLabel htmlFor="teacher-subject">
                          Subject
                        </FieldLabel>
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
                        <FieldLabel htmlFor="teacher-address">
                          Address
                        </FieldLabel>
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
        </Dialog> */}
        <TeacherForm />
      </div>

      <SearchBar
        param="search"
        placeholder="Search by name, phone, or subject"
        className="max-w-md"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      <UserRound className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{teacher.fullName}</p>
                      {teacher.email ? (
                        <p className="text-xs text-muted-foreground">
                          {teacher.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{teacher.phone ?? "—"}</TableCell>
                <TableCell>{teacher.subject ?? "—"}</TableCell>
                <TableCell>{teacher.planCount}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      teacher.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }
                  >
                    {teacher.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/org/dashboard/setting/teacher/${teacher.id}`}>
                    <Button variant="default" size="icon">
                      <PencilIcon className="size-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                {search
                  ? "No teachers match this search."
                  : "No teachers yet. Add one to get started."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControls totalPages={totalPages} />
    </div>
  )
}
