"use client"

import { useEffect, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActiveFoodPlanOption } from "@/types/food-types"
import { AvailableBed, AvailableRoomOption } from "@/types/room-type"

import type { AdmissionFormType } from "../schema/admission-schema"

function formatBedLabel(bed: AvailableBed) {
  return `Bed ${bed.bedNumber}`
}

export default function StudentFoodAndRoom({
  foodPlans,
  availableRooms,
}: {
  foodPlans: ActiveFoodPlanOption[]
  availableRooms: AvailableRoomOption[]
}) {
  const { control, watch, setValue } = useFormContext<AdmissionFormType>()

  const selectedRoomId = watch("roomId")
  const selectedBedNumber = watch("bedNumber")

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room.id === selectedRoomId),
    [availableRooms, selectedRoomId]
  )

  const roomsWithSpace = useMemo(
    () => availableRooms.filter((room) => !room.isFull),
    [availableRooms]
  )

  useEffect(() => {
    setValue("bedNumber", "", { shouldDirty: true })
  }, [selectedRoomId, setValue])
  useEffect(() => {
    if (!selectedRoom || !selectedBedNumber) return
    const isStillAvailable = selectedRoom.availableBeds.some(
      (bed) => String(bed.bedNumber) === selectedBedNumber
    )
    if (!isStillAvailable) {
      setValue("bedNumber", "", { shouldDirty: true })
    }
  }, [selectedRoom, selectedBedNumber, setValue])

  return (
    <div className="flex flex-col justify-around gap-4 sm:flex-row">
      <FieldSet className="w-full sm:basis-1/2">
        <FieldLegend>Room assignment</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="roomId"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel htmlFor="admission-room">Room</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="admission-room"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsWithSpace.length > 0 ? (
                      roomsWithSpace.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} · Floor {room.floor} ·{" "}
                          {room.availableCount} bed
                          {room.availableCount === 1 ? "" : "s"} free
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-rooms" disabled>
                        No rooms with available beds
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Only active rooms with at least one free bed are shown.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          {selectedRoom && (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Badge variant="outline">
                {selectedRoom.lodgingPlanName} · Rs. {selectedRoom.monthlyPrice}
                /mo
              </Badge>
              {selectedRoom.attachedBathroom && (
                <Badge variant="outline">Attached bathroom</Badge>
              )}
              {selectedRoom.airConditioner && (
                <Badge variant="outline">AC</Badge>
              )}
              <Badge variant="outline">
                {selectedRoom.occupiedCount}/{selectedRoom.totalBeds} occupied
              </Badge>
            </div>
          )}

          <Controller
            control={control}
            name="bedNumber"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel htmlFor="admission-bed">Bed</FieldLabel>
                <Select
                  value={field.value}
                  disabled={!selectedRoom}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="admission-bed"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue
                      placeholder={
                        selectedRoom
                          ? "Select an available bed"
                          : "Select a room first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedRoom?.availableBeds.map((bed) => (
                      <SelectItem
                        key={bed.bedNumber}
                        value={String(bed.bedNumber)}
                      >
                        {formatBedLabel(bed)}
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

      <FieldSet className="w-full sm:basis-1/2">
        <FieldLegend>Food plan</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="foodPlanId"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel htmlFor="admission-food-plan">Food plan</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="admission-food-plan"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Select a food plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {foodPlans.length > 0 ? (
                      foodPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} · Rs. {plan.monthlyPrice}/mo
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-food-plans" disabled>
                        No active food plans available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Monthly food charge snapshot is saved with the student
                  assignment.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
