"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, DoorOpen, Loader2, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormSaveBar } from "@/app/org/dashboard/_components/form-save-bar"
import { getLodgingAction } from "@/app/org/dashboard/setting/lodging/action/lodging"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"
import type { RoomItem } from "@/types/room-type"

import { deleteRoomAction, updateRoomAction } from "../../action/rooms"
import {
  editRoomSchema,
  type EditRoomSchemaType,
} from "../../schema/room-schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type LodgingOption = {
  id: string
  name: string
}

function roomToFormValues(room: RoomItem): EditRoomSchemaType {
  return {
    roomId: room.id,
    roomNumber: String(room.roomNumber),
    floor: String(room.floor),
    fans: String(room.fans),
    totalBeds: String(room.totalBeds),
    attachedBathroom: room.attachedBathroom,
    airConditioner: room.airConditioner,
    lodgingPlanId: room.lodgingPlanId,
    status: room.status === "inactive" ? "inactive" : "active",
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

export default function RoomDetailEditForm({ room }: { room: RoomItem }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [lodgingPlans, setLodgingPlans] = useState<LodgingOption[]>([])

  const defaultValues = useMemo(() => roomToFormValues(room), [room])

  const form = useForm<EditRoomSchemaType>({
    resolver: zodResolver(editRoomSchema),
    defaultValues,
  })

  const { isDirty } = form.formState

  useEffect(() => {
    form.reset(roomToFormValues(room))
  }, [room.id, room.lodgingPlanId, room.updatedAt, form])

  useEffect(() => {
    let cancelled = false

    async function loadLodgingPlans() {
      setIsLoadingPlans(true)
      try {
        const response = await getLodgingAction(null)
        if (cancelled) return

        if (!response.success || !response.data) {
          toast.error(response.message ?? "Failed to load lodging plans")
          setLodgingPlans([])
          return
        }

        const activePlans = response.data
          .filter((plan) => plan.status === "active")
          .map((plan) => ({ id: plan.id, name: plan.name }))

        const currentPlanInList = activePlans.some(
          (plan) => plan.id === room.lodgingPlanId
        )

        if (!currentPlanInList) {
          activePlans.unshift({
            id: room.lodgingPlanId,
            name: room.lodgingPlanName ?? "Current lodging plan",
          })
        }

        setLodgingPlans(activePlans)
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load lodging plans"
          )
          setLodgingPlans([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlans(false)
        }
      }
    }

    loadLodgingPlans()

    return () => {
      cancelled = true
    }
  }, [room.lodgingPlanId, room.lodgingPlanName])

  async function onSubmit(values: EditRoomSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateRoomAction(values)
      if (response.success) {
        form.reset(values)
        toast.success(response.message ?? "Room updated successfully")
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors.length > 0) {
              form.setError(field as keyof EditRoomSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update room"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    form.reset(defaultValues)
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-24">
      <Button
        type="button"
        variant="ghost"
        className="-ml-2"
        onClick={() => router.push("/org/dashboard/setting/room")}
      >
        <ArrowLeft className="size-4" />
        Rooms
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="size-5" />
                Room {room.roomNumber}
              </CardTitle>
              <CardDescription>
                Update room details. Created by {room.createdByName ?? "—"} on{" "}
                {formatDate(room.createdAt)}.
              </CardDescription>
            </div>
            <DeleteRoomDialog room={room} />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="roomNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-number">
                        Room number
                      </FieldLabel>
                      <Input
                        id="edit-room-number"
                        inputMode="numeric"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="floor"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-floor">Floor</FieldLabel>
                      <Input
                        id="edit-room-floor"
                        inputMode="numeric"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Use 0 for ground floor.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="totalBeds"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-total-beds">
                        Total beds
                      </FieldLabel>
                      <Input
                        id="edit-room-total-beds"
                        inputMode="numeric"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldDescription>
                        Cannot be reduced below the highest assigned bed while
                        students are in this room.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="fans"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-fans">Fans</FieldLabel>
                      <Input
                        id="edit-room-fans"
                        inputMode="numeric"
                        disabled={isLoading}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="lodgingPlanId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-lodging-plan">
                        Lodging plan
                      </FieldLabel>
                      <Select
                        key={`lodging-plan-${field.value}-${lodgingPlans.length}`}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={isLoading || isLoadingPlans}
                      >
                        <SelectTrigger id="edit-room-lodging-plan">
                          <SelectValue
                            placeholder={
                              isLoadingPlans
                                ? "Loading plans..."
                                : lodgingPlans.length === 0
                                  ? "No lodging plans"
                                  : "Select a lodging plan"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {lodgingPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="attachedBathroom"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-attached-bathroom">
                        Attached bathroom
                      </FieldLabel>
                      <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                        <Checkbox
                          id="edit-room-attached-bathroom"
                          checked={field.value}
                          disabled={isLoading}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                        <span className="text-sm">
                          Room has attached bathroom
                        </span>
                      </label>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="airConditioner"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel htmlFor="edit-room-air-conditioner">
                        Air conditioner
                      </FieldLabel>
                      <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                        <Checkbox
                          id="edit-room-air-conditioner"
                          checked={field.value}
                          disabled={isLoading}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                        <span className="text-sm">
                          Room has air conditioning
                        </span>
                      </label>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="status"
                  render={({ field, fieldState }) => {
                    const isActive = field.value === "active"

                    return (
                      <Field
                        data-invalid={!!fieldState.error}
                        className="sm:col-span-2"
                      >
                        <FieldLabel htmlFor="edit-room-status">
                          Status
                        </FieldLabel>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                            isActive && "border-primary bg-primary/5",
                            isLoading && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {isActive ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isActive
                                ? "Room is available for student assignments."
                                : "Inactive rooms are hidden from new assignments."}
                            </p>
                          </div>
                          <Checkbox
                            id="edit-room-status"
                            disabled={isLoading}
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked === true ? "active" : "inactive"
                              )
                            }
                          />
                        </label>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )
                  }}
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
        message="Unsaved changes"
        resetLabel="Reset"
        saveLabel="Save changes"
        dialogTitle="Update room?"
        dialogDescription="Changes will apply to this room. Existing student assignments keep their saved lodging amount until reassigned."
        confirmLabel="Confirm update"
        cancelLabel="Cancel"
      />
    </div>
  )
}

function DeleteRoomDialog({ room }: { room: RoomItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await deleteRoomAction({ roomId: room.id })
      if (response.success) {
        toast.success(response.message ?? "Room deleted successfully")
        setIsOpen(false)
        router.push("/org/dashboard/setting/room")
      } else {
        toast.error(response.message ?? "Failed to delete room")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete room"
      )
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete room</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this room?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
