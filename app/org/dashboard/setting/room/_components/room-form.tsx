"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { getLodgingAction } from "@/app/org/dashboard/setting/lodging/action/lodging"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

import {
  createRoomDefaultValues,
  createRoomSchema,
  type CreateRoomSchemaType,
} from "../schema/room-schema"
import { createRoomAction } from "../action/rooms"

type LodgingOption = {
  id: string
  name: string
}

export default function RoomForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [lodgingPlans, setLodgingPlans] = useState<LodgingOption[]>([])

  const form = useForm<CreateRoomSchemaType>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: createRoomDefaultValues,
  })

  useEffect(() => {
    if (!open) return

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

        setLodgingPlans(
          response.data
            .filter((plan) => plan.status === "active")
            .map((plan) => ({ id: plan.id, name: plan.name }))
        )
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
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(createRoomDefaultValues)
    }
  }

  async function onSubmit(values: CreateRoomSchemaType) {
    setIsLoading(true)
    try {
      const response = await createRoomAction(values)

      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(createRoomDefaultValues)
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof CreateRoomSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create room"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add Room
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-2xl")}>
        <DialogTitle>Add Room</DialogTitle>
        <DialogDescription>
          Create a room with bed layout and assign a lodging plan for billing.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="roomNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="room-number">Room number</FieldLabel>
                    <Input
                      id="room-number"
                      inputMode="numeric"
                      placeholder="101"
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
                name="totalBeds"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="room-total-beds">
                      Total beds
                    </FieldLabel>
                    <Input
                      id="room-total-beds"
                      inputMode="numeric"
                      placeholder="Total beds"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Total number of beds in the room.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="floor"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="room-floor">Floor</FieldLabel>
                    <Input
                      id="room-floor"
                      inputMode="numeric"
                      placeholder="1"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>Use 0 for ground floor.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="fans"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="room-fans">Fans</FieldLabel>
                    <Input
                      id="room-fans"
                      inputMode="numeric"
                      placeholder="0"
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
                    <FieldLabel htmlFor="room-lodging-plan">
                      Lodging plan
                    </FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isLoading || isLoadingPlans}
                    >
                      <SelectTrigger id="room-lodging-plan">
                        <SelectValue
                          placeholder={
                            isLoadingPlans
                              ? "Loading plans..."
                              : lodgingPlans.length === 0
                                ? "No active lodging plans"
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
                    <FieldDescription>
                      Only active lodging plans are shown.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="attachedBathroom"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="room-attached-bathroom">
                      Attached bathroom
                    </FieldLabel>
                    <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                      <Checkbox
                        id="room-attached-bathroom"
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
                    <FieldLabel htmlFor="room-air-conditioner">
                      Air conditioner
                    </FieldLabel>
                    <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
                      <Checkbox
                        id="room-air-conditioner"
                        checked={field.value}
                        disabled={isLoading}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <span className="text-sm">Room has air conditioning</span>
                    </label>
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
            onClick={() => form.reset(createRoomDefaultValues)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isLoadingPlans || lodgingPlans.length === 0}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create room"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
