import z from "zod"

const amountSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")

export const foodingStatusValues = ["active", "inactive"] as const

export const createFoodingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Food plan name is required")
    .max(255, "Food plan name must be at most 255 characters"),
  monthlyPrice: amountSchema,
})

export type CreateFoodingSchemaType = z.infer<typeof createFoodingSchema>

export const createFoodingDefaultValues: CreateFoodingSchemaType = {
  name: "",
  monthlyPrice: "",
}

export const editFoodingSchema = createFoodingSchema.extend({
  foodPlanId: z.uuid("Invalid food plan id"),
  status: z.enum(foodingStatusValues, {
    message: "Invalid food plan status",
  }),
})

export type EditFoodingSchemaType = z.infer<typeof editFoodingSchema>

export const deleteFoodingSchema = z.object({
  foodPlanId: z.uuid("Invalid food plan id"),
})

export type DeleteFoodingSchemaType = z.infer<typeof deleteFoodingSchema>
