"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormSaveBar } from "@/app/org/dashboard/_components/form-save-bar"

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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  staffSalarySchema,
  type StaffSalarySchemaType,
} from "../schema/staffSalary"
import { updateStaffSalaryAction } from "../action/updateStaffSalary"
import { StaffSalaryContract } from "@/types/staff-type"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatDateYearMonth,
  formatRupee,
  formatStatus,
} from "../../../lib/utils"
import { Badge } from "@/components/ui/badge"

function formatStaffSalaryStatus(status: string) {
  return (
    <>
      {status === "active" && (
        <Badge className="bg-green-500 text-white">Active</Badge>
      )}
      {status === "inactive" && (
        <Badge className="bg-red-500 text-white">Inactive</Badge>
      )}
    </>
  )
}

interface StaffSalaryProps {
  memberId: string
  salary: string | null
  salaryHistory: StaffSalaryContract[] | null
}

export default function StaffSalary({
  memberId,
  salary,
  salaryHistory,
}: StaffSalaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const defaultValues = useMemo(() => {
    return {
      staffId: memberId,
      monthlyAmount: salary ?? "",
    }
  }, [memberId, salary])
  const form = useForm<StaffSalarySchemaType>({
    resolver: zodResolver(staffSalarySchema),
    defaultValues: defaultValues,
  })

  const { isDirty } = form.formState

  async function onSubmit(values: StaffSalarySchemaType) {
    setIsLoading(true)
    try {
      const response = await updateStaffSalaryAction({
        ...values,
        staffId: memberId,
      })
      if (response.success) {
        form.reset(values)
        toast.success(response.message)
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof StaffSalarySchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update staff salary"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Monthly salary contract</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldLegend>Active contract</FieldLegend>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="monthlyAmount"
                  render={({ field, fieldState }) => (
                    <Field
                      className="sm:col-span-2"
                      data-invalid={!!fieldState.error}
                    >
                      <FieldLabel htmlFor="staff-monthly-amount">
                        Monthly salary
                      </FieldLabel>
                      <Input
                        id="staff-monthly-amount"
                        inputMode="decimal"
                        placeholder="25000.00"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Fixed monthly amount paid to this staff member.
                      </FieldDescription>
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
          <CardTitle>Salary history</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monthly amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective from</TableHead>
                <TableHead>Effective to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory && salaryHistory.length > 0 ? (
                salaryHistory.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      {formatRupee(salary.monthlyAmount ?? 0)}
                    </TableCell>
                    <TableCell>
                      {formatStaffSalaryStatus(salary.status)}
                    </TableCell>
                    <TableCell>
                      {formatDateYearMonth(new Date(salary.effectiveFrom))}
                    </TableCell>
                    <TableCell>
                      {salary.effectiveTo
                        ? formatDateYearMonth(new Date(salary.effectiveTo))
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No salary history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FormSaveBar
        isDirty={isDirty}
        isLoading={isLoading}
        onReset={() => form.reset(defaultValues)}
        onConfirm={form.handleSubmit(onSubmit)}
        dialogTitle="Update staff salary?"
        dialogDescription="Saving amount or effective date creates a new contract and closes the previous active one."
        confirmLabel="Save salary"
      />
    </div>
  )
}
