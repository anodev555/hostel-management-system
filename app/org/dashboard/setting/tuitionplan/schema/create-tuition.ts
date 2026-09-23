import z from "zod"

const amountSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")

export const tuitionStatusValues = ["active", "inactive"] as const

export const createTuitionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tuition plan name is required")
    .max(255, "Tuition plan name must be at most 255 characters"),
  monthlyPrice: amountSchema,
  teacherId: z.uuid("Select a teacher"),
})

export type CreateTuitionSchemaType = z.infer<typeof createTuitionSchema>

export const createTuitionDefaultValues: CreateTuitionSchemaType = {
  name: "",
  monthlyPrice: "",
  teacherId: "",
}

export const editTuitionSchema = z.object({
  tuitionPlanId: z.uuid("Invalid tuition plan id"),
  teacherId: z.uuid("Invalid teacher id"),
  name: z
    .string()
    .trim()
    .min(1, "Tuition plan name is required")
    .max(255, "Tuition plan name must be at most 255 characters"),
  monthlyPrice: amountSchema,
  status: z.enum(tuitionStatusValues, {
    message: "Invalid tuition plan status",
  }),
})

export type EditTuitionSchemaType = z.infer<typeof editTuitionSchema>

export const deleteTuitionSchema = z.object({
  tuitionPlanId: z.uuid("Invalid tuition plan id"),
})

export type DeleteTuitionSchemaType = z.infer<typeof deleteTuitionSchema>
