import z from "zod"

const nonNegativeIntString = z
  .string()
  .trim()
  .regex(/^\d+$/, "Must be a whole number")
  .refine((value) => Number(value) >= 0, "Must be 0 or greater")

const positiveIntString = z
  .string()
  .trim()
  .regex(/^\d+$/, "Must be a whole number")
  .refine((value) => Number(value) > 0, "Must be greater than 0")

export const createRoomSchema = z
  .object({
    roomNumber: positiveIntString,
    floor: nonNegativeIntString,
    fans: nonNegativeIntString,
    totalBeds: nonNegativeIntString,
    attachedBathroom: z.boolean(),
    airConditioner: z.boolean(),
    lodgingPlanId: z.uuid("Select a lodging plan"),
  })
  .refine((data) => Number(data.totalBeds) > 0, {
    message: "Room must have at least one bed",
    path: ["totalBeds"],
  })

export type CreateRoomSchemaType = z.infer<typeof createRoomSchema>

export const roomStatusValues = ["active", "inactive"] as const

export const editRoomSchema = createRoomSchema.extend({
  roomId: z.uuid("Invalid room id"),
  status: z.enum(roomStatusValues, {
    message: "Invalid room status",
  }),
})

export type EditRoomSchemaType = z.infer<typeof editRoomSchema>

export const createRoomDefaultValues: CreateRoomSchemaType = {
  roomNumber: "",
  floor: "",
  fans: "0",
  totalBeds: "",
  attachedBathroom: false,
  airConditioner: false,
  lodgingPlanId: "",
}
