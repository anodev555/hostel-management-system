"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, PlusIcon, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  createStaffSchema,
  type CreateStaffSchemaType,
} from "../schema/createStaff"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { createStaffAction } from "../action/create-staff"
import { getRolesDataAction, RoleData } from "../../roles/action/public-getroles"
import { error } from "console"

function formatRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function StaffForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [roles, setRoles] = useState<RoleData[]>([])

  const form = useForm<CreateStaffSchemaType>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      salary: "",
      contactPhone: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
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

  async function onSubmit(values: CreateStaffSchemaType) {
    setIsLoading(true)
    try {
      const response = await createStaffAction(values)

      if (response.success) {
        toast.success(response.message ?? "Staff created successfully")
        form.reset()
        setOpen(false)
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, error]) => {
            if (error && error.length > 0) {
              form.setError(field as keyof CreateStaffSchemaType, {
                message: error.join(", "),
              })
            }
          })
        }



      }


    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create staff"
      )
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  const isFormDisabled = isLoading || isLoadingRoles

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          <PlusIcon /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-2xl")}>
        <DialogTitle>Add Staff</DialogTitle>
        <DialogDescription>
          Create a staff account and assign an existing role for this hostel.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} id="staff-form">
          <CardContent className="space-y-8">
            <FieldSet>
              <FieldGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field
                      className="sm:col-span-2"
                      data-invalid={!!fieldState.error}
                    >
                      <FieldLabel htmlFor="staff-name">Full name</FieldLabel>
                      <Input
                        id="staff-name"
                        placeholder="Staff Name"
                        disabled={isFormDisabled}
                        aria-invalid={!!fieldState.error}
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
                      <FieldLabel htmlFor="staff-email">Email</FieldLabel>
                      <Input
                        id="staff-email"
                        type="email"
                        autoComplete="email"
                        placeholder="staff's email"
                        disabled={isFormDisabled}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="contactPhone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="staff-phone">Phone</FieldLabel>
                      <Input
                        id="staff-phone"
                        type="tel"
                        placeholder="9800000000"
                        disabled={isFormDisabled}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Optional contact number.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field
                      className="sm:col-span-2"
                      data-invalid={!!fieldState.error}
                    >
                      <FieldLabel htmlFor="staff-username">Username</FieldLabel>
                      <Input
                        id="staff-username"
                        autoComplete="username"
                        placeholder="username"
                        disabled={isFormDisabled}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        8–15 characters. Used to sign in.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="staff-password">Password</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="staff-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          disabled={isFormDisabled}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                          >
                            {showPassword ? (
                              <Eye className="size-4" />
                            ) : (
                              <EyeOff className="size-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="staff-confirm-password">
                        Confirm password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="staff-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          disabled={isFormDisabled}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                          >
                            {showConfirmPassword ? (
                              <Eye className="size-4" />
                            ) : (
                              <EyeOff className="size-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="salary"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="staff-salary">Salary</FieldLabel>
                      <Input
                        {...field}
                        id="staff-salary"
                        placeholder="10000"
                        disabled={isFormDisabled}
                        aria-invalid={!!fieldState.error}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Role</FieldLegend>
              <FieldDescription className="">
                Assign an existing hostel role to this staff member.
              </FieldDescription>

              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    {/* <FieldLabel htmlFor="staff-role">Role</FieldLabel> */}
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isFormDisabled || roles.length === 0}
                    >
                      <SelectTrigger
                        id="staff-role"
                        className="w-full"
                        aria-invalid={!!fieldState.error}
                      >
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
                      <SelectContent
                        className="max-h-[200px] overflow-y-auto"
                        align="start"
                      >
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
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldSet>
          </CardContent>
        </form>
        <DialogFooter>
          <Button
            type="reset"
            variant="outline"
            disabled={isFormDisabled}
            onClick={() => form.reset()}
            form="staff-form"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            form="staff-form"
            disabled={isFormDisabled || roles.length === 0}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create staff"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
