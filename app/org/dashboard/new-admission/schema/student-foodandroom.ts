import z from "zod"

export const studentFoodAndRoomSchema = z.object({
  roomId: z.uuid("Select a room"),

  bedNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, "Select a bed")
    .refine((value) => Number(value) >= 1, "Select a valid bed"),
  foodPlanId: z.uuid("Select a food plan"),
})

export type StudentFoodAndRoomSchemaType = z.infer<
  typeof studentFoodAndRoomSchema
>

export const studentFoodAndRoomDefaultValues: StudentFoodAndRoomSchemaType = {
  roomId: "",
  bedNumber: "",
  foodPlanId: "",
}

export const studentFoodAndRoomFieldKeys = Object.keys(
  studentFoodAndRoomDefaultValues
) as (keyof StudentFoodAndRoomSchemaType)[]
