"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PlusIcon, ShieldPlus } from "lucide-react"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { orgPermissions } from "@/lib/org-permissions"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateRoleSchemaType, roleSchema } from "../schema/roleSchema"
import { createRoleAction } from "../action/create-role"
import { Checkbox } from "@/components/ui/checkbox"

const RESOURCES = Object.keys(orgPermissions) as [
  keyof typeof orgPermissions,
  ...(keyof typeof orgPermissions)[],
]
// type PermissionAction = "create" | "read" | "update" | "delete" |"collectpayment" | "checkout"
// Extract all unique actions from orgPermissions
const ALL_ACTIONS = Array.from(
  new Set(
    Object.values(orgPermissions).flat()
  )
) as ["create" | "read" | "update" | "delete" | "collectpayment" | "checkout" | "edit"]

type PermissionAction = typeof ALL_ACTIONS[number]

function formatLabel(value: string) {
  if (value === "ac") return "Access Control"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function RoleForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset()
    }
  }

  const form = useForm<CreateRoleSchemaType>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      permissions: {
        ...Object.fromEntries(RESOURCES.map((resource) => [resource, []])),
      } as Record<string, string[]>,
    },
  })

  async function onSubmit(values: CreateRoleSchemaType) {
    setIsLoading(true)
    try {
      const response = await createRoleAction(values)
      if (response.success) {
        setOpen(false)
        toast.success(response.message)
        form.reset()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          for (const [field, errors] of Object.entries(response.fieldErrors)) {
            form.setError(field as keyof CreateRoleSchemaType, {
              message: errors.join(", "),
            })
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create role"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const permissionsError = form.formState.errors.permissions

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          <PlusIcon className="size-4" /> Add Role
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-2xl")}>
        <DialogTitle>Create Role</DialogTitle>
        <DialogDescription>
          Define a custom role and assign permissions for this hostel.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="role-name">Role name</FieldLabel>
                    <Input
                      id="role-name"
                      placeholder="Warden"
                      className="sm:max-w-xs"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />

                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet className="mt-4">
            <FieldLegend>Permissions</FieldLegend>
            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
              {RESOURCES.map((resource) => (
                <Controller
                  key={resource}
                  control={form.control}
                  name={`permissions.${resource}`}
                  render={({ field, fieldState }) => {
                    const selected = field.value ?? []

                    return (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel>{formatLabel(resource)}</FieldLabel>

                        <div
                          data-slot="checkbox-group"
                          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                        >
                          {(orgPermissions[resource] as PermissionAction[]).map(
                            (action) => {
                              const checked = selected.includes(action)
                              const inputId = `${resource}-${action}`

                              return (
                                <label
                                  key={action}
                                  className={cn(
                                    "flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                                    checked && "border-primary bg-primary/5",
                                    isLoading && "cursor-not-allowed opacity-50"
                                  )}
                                >
                                  <Checkbox
                                    id={inputId}
                                    role="checkbox"
                                    className="size-4 accent-primary"
                                    disabled={isLoading}
                                    checked={checked}
                                    onCheckedChange={(checked) => {
                                      const next =
                                        checked === true
                                          ? selected.includes(action)
                                            ? selected
                                            : [...selected, action]
                                          : selected.filter(
                                              (a: string) => a !== action
                                            )
                                      field.onChange(next)
                                    }}
                                  />
                                  {formatLabel(action)}
                                </label>
                              )
                            }
                          )}
                        </div>

                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )
                  }}
                />
              ))}
            </div>

            {permissionsError?.message && (
              <FieldError className="mt-2">
                {permissionsError.message}
              </FieldError>
            )}
          </FieldSet>
        </form>
        <DialogFooter>
          <Button
            type="reset"
            variant="outline"
            disabled={isLoading}
            onClick={() => form.reset()}
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
              "Create role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
