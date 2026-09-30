"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VisitorStudentOption } from "@/types/visitor-type"
import {
  checkinVisitorDefaultValues,
  checkinVisitorSchema,
  CheckinVisitorSchemaType,
} from "../schema/visitorSchema"
import { checkinVisitorAction, getVisitorStudentsAction } from "../action/visitors"

export default function VisitorCheckinForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<VisitorStudentOption[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)

  const form = useForm<CheckinVisitorSchemaType>({
    resolver: zodResolver(checkinVisitorSchema),
    defaultValues: checkinVisitorDefaultValues,
  })

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function loadStudents() {
      setStudentsLoading(true)
      try {
        const response = await getVisitorStudentsAction({})
        if (!cancelled && response.success) {
          setStudents(response.data)
        } else if (!cancelled) {
          toast.error(response.message || "Failed to load students")
        }
      } catch {
        if (!cancelled) toast.error("Failed to load students")
      } finally {
        if (!cancelled) setStudentsLoading(false)
      }
    }
    loadStudents()
    return () => {
      cancelled = true
    }
  }, [open ])

  async function onSubmit(values: CheckinVisitorSchemaType) {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await checkinVisitorAction(values)
      if (response.success) {
        toast.success(response.message || "Visitor checked in successfully")
        form.reset(checkinVisitorDefaultValues)
        setOpen(false)
      } else {
        toast.error(response.message || "Failed to check in visitor")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) form.reset(checkinVisitorDefaultValues)
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Check In Visitor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Check In Visitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="visitorName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Visitor name</FieldLabel>
                <Input placeholder="Full name of the visitor" {...field} disabled={isLoading} />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="relation"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Relation</FieldLabel>
                  <Input placeholder="e.g. Parent, Friend" {...field} disabled={isLoading} />
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="age"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Age (optional)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={150}
                    placeholder="e.g. 45"
                    disabled={isLoading}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="studentId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Visiting student</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading || studentsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={studentsLoading ? "Loading students…" : "Select a student"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="expectedVisitDuration"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Expected visit time (optional)</FieldLabel>
                <Input placeholder="e.g. 30 min, 2 hours" {...field} disabled={isLoading} />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Reason to visit</FieldLabel>
                <Textarea
                  placeholder="Why is the visitor here?"
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking in…
                </>
              ) : (
                "Check In"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
