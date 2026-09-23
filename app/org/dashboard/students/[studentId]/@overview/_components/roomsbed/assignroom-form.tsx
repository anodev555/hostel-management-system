"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AvailableRoomOption } from "@/types/room-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  studentRoomDefaultValues,
  studentRoomSchema,
  StudentRoomSchemaType,
} from "../../schema/student-roomfoodtuition"
import { useEffect, useMemo,  useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateRoomAction } from "../../action/update-room"
import { toast } from "sonner"

export default function AssignRoomForm({
  studentId,
  rooms,
  onAssign,
}: {
  studentId: string
  rooms: AvailableRoomOption[]
  onAssign: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<StudentRoomSchemaType>({
    resolver: zodResolver(studentRoomSchema),
    defaultValues: { ...studentRoomDefaultValues, studentId },
  })

  const { watch } = form
  const selectedRoomId = watch("roomId")

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.id === selectedRoomId)
  }, [rooms, selectedRoomId])

  useEffect(() => {
    form.setValue("bedNumber", "", { shouldDirty: true })
  }, [selectedRoomId, form])

  async function onSubmit(data: StudentRoomSchemaType) {
    if (isPending) return
    startTransition(async () => {
      try {
        const response = await updateRoomAction({
          ...data,
          studentId,
        })
        if (response.success) {
          toast.success(response.message)
          form.reset({ ...studentRoomDefaultValues, studentId })
          router.refresh()
          onAssign?.()
        }
        if (!response.success) {
          toast.error(response.message)
          if (response.fieldErrors) {
            Object.entries(response.fieldErrors).forEach(([field, error]) => {
              if (error.length > 0) {
                form.setError(field as keyof StudentRoomSchemaType, {
                  message: error[0],
                })
              }
            })
          }
        }
      } catch (error) {
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      }
    })
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Assign Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet className="w-full sm:basis-1/2">
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="roomId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel>Room</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select an room first" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.roomNumber} · Floor {room.floor} ·{" "}
                              {room.availableBeds.length} free beds
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error ? (
                        <FieldError>{fieldState.error.message}</FieldError>
                      ) : null}
                      {selectedRoom && (
                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          <Badge variant="outline">
                            {selectedRoom.lodgingPlanName} · Rs.{" "}
                            {selectedRoom.monthlyPrice}
                            /mo
                          </Badge>
                          {selectedRoom.attachedBathroom && (
                            <Badge variant="outline">Attached bathroom</Badge>
                          )}
                          {selectedRoom.airConditioner && (
                            <Badge variant="outline">AC</Badge>
                          )}
                          <Badge variant="outline">
                            {selectedRoom.occupiedCount}/
                            {selectedRoom.totalBeds} occupied
                          </Badge>
                        </div>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="bedNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel>Bed</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedRoom}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select an available bed" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRoom?.availableBeds.map((bed) => (
                            <SelectItem
                              key={bed.bedNumber}
                              value={bed.bedNumber.toString()}
                            >
                              {bed.bedNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error ? (
                        <FieldError>{fieldState.error.message}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                form.reset({ ...studentRoomDefaultValues, studentId })
              }
            >
              Reset
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending ? "Assigning..." : "Assign Room"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
