"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog as DialogPrimitive } from "radix-ui"
import { ArrowLeft, Loader2, Shield, Trash2, TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { deleteRoleAction } from "../action/delete-role"
import { updateRoleAction } from "../action/update-role"
import {
  editRoleSchema,
  type EditRoleSchemaType,
} from "../schema/edit-roleSchema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { RoleItem } from "@/types/role/roles-type"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormSaveBar } from "../../../_components/form-save-bar"

const RESOURCES = Object.keys(orgPermissions) as [
  keyof typeof orgPermissions,
  ...(keyof typeof orgPermissions)[],
]
type PermissionAction = "create" | "read" | "update" | "delete"
const ALL_ACTIONS: PermissionAction[] = ["create", "read", "update", "delete"]
function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function parsePermissionRecord(
  permission: string
): EditRoleSchemaType["permissions"] {
  const parsed = JSON.parse(permission) as Record<string, string[]>
  return Object.fromEntries(
    RESOURCES.map((resource) => [
      resource,
      (parsed[resource] ?? []).filter((action): action is PermissionAction =>
        (orgPermissions[resource] as PermissionAction[]).includes(
          action as PermissionAction
        )
      ),
    ])
  ) as EditRoleSchemaType["permissions"]
}

function roleToFormValues(role: RoleItem): EditRoleSchemaType {
  return {
    roleId: role.id,
    name: role.role,
    permissions: parsePermissionRecord(role.permission),
  }
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function RoleDetail({ role }: { role: RoleItem }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const defaultValues = useMemo(() => roleToFormValues(role), [role])

  const form = useForm<EditRoleSchemaType>({
    resolver: zodResolver(editRoleSchema),
    defaultValues,
  })

  const { isDirty } = form.formState
  const permissionsError = form.formState.errors.permissions

  async function onSubmit(values: EditRoleSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateRoleAction(values)
      if (response.success) {
        setConfirmOpen(false)
        form.reset(values)
        toast.success(response.message ?? "Role updated successfully")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, error]) => {
            if (error.length > 1) {
              form.setError(field as keyof EditRoleSchemaType, {
                message: error.join(", "),
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    form.reset(defaultValues)
  }

  async function handleRoleDelete(roleId: string) {
    setIsLoading(true)
    try {
      const result = await deleteRoleAction({ roleId })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message ?? "Role deleted successfully")
      router.push("/org/dashboard/roles")
      router.refresh()
      setDeleteOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <Card className="">
        {" "}
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/org/dashboard/roles")}
            >
              <ArrowLeft className="size-4" />
              Roles
            </Button>

            <CardTitle className="flex items-center gap-2 capitalize">
              <Shield className="size-5" />
              {role.role}
            </CardTitle>
            <CardDescription>
              View and edit role permissions for this hostel.
            </CardDescription>
          </div>
          <div>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
              size="xs"
              className="px-3 py-4"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>{" "}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 rounded-xl bg-muted/30 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Created by
              </p>
              <p className="mt-1 text-sm font-medium">
                {role.createdByUsername ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Created at
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDate(role.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Updated at
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDate(role.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-8">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup className="">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="role-name">Role name</FieldLabel>
                      <Input
                        id="role-name"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Provide role name in lowercase.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend>Permissions</FieldLegend>
              <FieldDescription className="mb-4">
                Update what this role can access in your hostel.
              </FieldDescription>

              <div className="space-y-6">
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
                            {(
                              orgPermissions[resource] as PermissionAction[]
                            ).map((action) => {
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
                                    disabled={isLoading}
                                    checked={checked}
                                    onCheckedChange={(checked) => {
                                      const next =
                                        checked === true
                                          ? selected.includes(action)
                                            ? selected
                                            : [...selected, action]
                                          : selected.filter((a) => a !== action)
                                      field.onChange(next)
                                    }}
                                  />
                                  {formatLabel(action)}
                                </label>
                              )
                            })}
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
            </FieldSet>{" "}
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
        dialogTitle="Are you sure you want to update the role?"
        dialogDescription="The role will be updated and the changes will be saved"
        confirmLabel="Confirm Update"
        cancelLabel="Cancel"
      />

      {/* Delete Role Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This will only delete the role if the role is not assigned to any
            user.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleDelete(role.id)}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
