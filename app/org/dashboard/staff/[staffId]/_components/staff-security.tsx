"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  staffSecuritySchema,
  StaffSecuritySchemaType,
} from "../schema/staffSecurity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormSaveBar } from "../../../_components/form-save-bar"
import { staffResetPasswordAction } from "../action/staff-resetpassword"
import { toast } from "sonner"

interface StaffSecurityProps {
  userId: string
  staffId: string
}

function staffToDefaultValues(userId: string, staffId: string) {
  return {
    userId: userId,
    staffId: staffId,
    password: "",
    confirmPassword: "",
  }
}
export default function StaffSecurity({ userId, staffId }: StaffSecurityProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()
  const defaultValues = staffToDefaultValues(userId, staffId)
  const form = useForm<StaffSecuritySchemaType>({
    resolver: zodResolver(staffSecuritySchema),
    defaultValues: defaultValues,
  })

  function handleReset() {
    form.reset()
  }
  const isDirty = form.formState.isDirty
  const isFormDisabled = isLoading

  async function onSubmit(values: StaffSecuritySchemaType) {
    try {
      setIsLoading(true)
      const response = await staffResetPasswordAction(values)
      if (!response.success) {
        setConfirmOpen(false)
        toast.error(response.message)
        return
      }
      toast.success(response.message)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      setConfirmOpen(false)
      toast.error(
        `${error instanceof Error ? error.message : "Something went wrong"} `
      )
    } finally {
      handleReset()
      setIsLoading(false)
    }
  }
  return (
    <>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldLegend>Reset Password</FieldLegend>
              <FieldGroup className="grid grid-cols-2 gap-3">
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="password"> New Password</FieldLabel>
                      <FieldDescription>
                        Enter the new password
                      </FieldDescription>
                      <Input
                        id="password"
                        {...field}
                        disabled={isFormDisabled}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <FieldDescription>
                        Confirm the new password
                      </FieldDescription>
                      <Input
                        id="confirmPassword"
                        {...field}
                        disabled={isFormDisabled}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
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
        message="unsaved changes"
        resetLabel="Reset"
        saveLabel="Save changes"
        dialogTitle="re you sure you want to reset the password?"
        dialogDescription="The Staff will logged out and need to login with the new password"
        confirmLabel="Confirm Reset"
        cancelLabel="Cancel"
      />
    </>
  )
}
