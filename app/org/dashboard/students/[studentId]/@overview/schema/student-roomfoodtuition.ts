import z from "zod"

export const studentRoomSchema = z.object({
  roomId: z.uuid("Select a room"),
  studentId: z.string("Select a student"),
  bedNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, "Select a bed")
    .refine((value) => Number(value) >= 1, "Select a valid bed"),
})

export type StudentRoomSchemaType = z.infer<typeof studentRoomSchema>

export const studentRoomDefaultValues: StudentRoomSchemaType = {
  roomId: "",
  studentId: "",
  bedNumber: "",
}

export const studentRoomFieldKeys = Object.keys(
  studentRoomDefaultValues
) as (keyof StudentRoomSchemaType)[]

//food
export const foodPlanSchema = z.object({
  foodPlanId: z.string().min(1),
  studentId: z.string().min(1),
})

export type FoodPlanSchemaType = z.infer<typeof foodPlanSchema>

export const foodPlanDefaultValues: FoodPlanSchemaType = {
  foodPlanId: "",
  studentId: "",
}

export const foodPlanFieldKeys = Object.keys(
  foodPlanDefaultValues
) as (keyof FoodPlanSchemaType)[]
//tuition
export const studentTuitionSchema = z.object({
  tuitionPlanId: z.uuid("Select a tuition plan"),
  studentId: z.string("Select a student"),
})

export type StudentTuitionSchemaType = z.infer<typeof studentTuitionSchema>

export const studentTuitionDefaultValues: StudentTuitionSchemaType = {
  tuitionPlanId: "",
  studentId: "",
}

export const studentTuitionFieldKeys = Object.keys(
  studentTuitionDefaultValues
) as (keyof StudentTuitionSchemaType)[]
