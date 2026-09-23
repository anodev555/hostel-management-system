"use client"

import { StaffDetail } from "@/types/staff-type"
import {
  staffProfileSchema,
  StaffProfileSchemaType,
} from "../schema/staffProfile"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useMemo, useState } from "react"
import {
  getRolesDataAction,
  RoleData,
} from "../../../roles/action/public-getroles"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateStaffProfileAction } from "../action/update-staffprofile"
import { useRouter } from "next/navigation"

interface StaffProfileProps {
  userId: string
  name: string
  email: string
  username: string
  contactPhone: string
  role: string
}
function formatRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function staffToFormValues(staff: StaffProfileProps) {
  return {
    userId: staff.userId,
    name: staff.name,
    email: staff.email,
    username: staff.username,
    contactPhone: staff.contactPhone,
    role: staff.role.toLowerCase(),
  }
}

export default function StaffProfile({
  staffDetail,
}: {
  staffDetail: StaffProfileProps
}) {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()
  console.log(staffDetail)
  const defaultValues = useMemo(
    () => staffToFormValues(staffDetail),
    [staffDetail]
  )
  const form = useForm<StaffProfileSchemaType>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: defaultValues,
  })

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await getRolesDataAction()
        if (response.success) {
          setRoles(response.data)
        } else {
          toast.error(response.message)
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load roles"
        )
      } finally {
        setIsLoadingRoles(false)
      }
    }

    loadRoles()
  }, [])

  function handleReset() {
    form.reset()
  }

  const isDirty = form.formState.isDirty
  const isFormDisabled = isLoadingRoles || isLoading

  async function onSubmit(values: StaffProfileSchemaType) {
    try {
      setIsLoading(true)
      const response = await updateStaffProfileAction(values)
      if (response.success) {
        form.reset(values)
        setConfirmOpen(false)
        toast.success(response.message)
        router.refresh()
      } else {
        setConfirmOpen(false)
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, error]) => {
            if (error.length > 1) {
              form.setError(field as keyof StaffProfileSchemaType, {
                message: error.join(", "),
              })
            }
          })
        }
      }
    } catch (error) {
      setConfirmOpen(false)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update staff profile"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        {/* <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader> */}
        <CardContent>
          {" "}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup className="grid grid-cols-2 gap-3">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <FieldDescription>Full name</FieldDescription>
                      <Input id="name" {...field} disabled={isFormDisabled} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <FieldDescription>Email address</FieldDescription>
                      <Input id="email" {...field} disabled={isFormDisabled} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="username">Username</FieldLabel>
                      <FieldDescription>
                        Provide username in lowercase
                      </FieldDescription>
                      <Input id="email" {...field} disabled={isFormDisabled} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="contactPhone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="Phone">Phone</FieldLabel>
                      <FieldDescription>
                        Provide your phone number
                      </FieldDescription>
                      <Input id="phone" {...field} disabled={isFormDisabled} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.invalid}>
                      <FieldLabel htmlFor="role">Role</FieldLabel>
                      <Select
                        value={field.value.toLowerCase()}
                        onValueChange={field.onChange}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingRoles
                                ? "Loading roles..."
                                : roles.length === 0
                                  ? "No roles available"
                                  : "Select a role"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.role.toLowerCase()}
                            >
                              {formatRoleLabel(role.role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-x-0 bottom-1 z-40 flex justify-center px-4 pb-4 transition-all duration-200",
          isDirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        )}
      >
        <div className="mx-auto flex w-fit items-center justify-between gap-4 rounded-xl border border-(--table-border) bg-muted/50 px-2 py-2">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <TriangleAlert size="18" />{" "}
            <span className="hidden font-medium sm:flex">unsaved changes</span>
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isLoading}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={isLoading}
              onClick={() => setConfirmOpen(true)}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save changes?</DialogTitle>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
