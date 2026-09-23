import z from "zod"

const amountSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")

export const lodgingStatusValues = ["active", "inactive"] as const

export const createLodgingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Lodging plan name is required")
    .max(255, "Lodging plan name must be at most 255 characters"),
  monthlyPrice: amountSchema,
})

export type CreateLodgingSchemaType = z.infer<typeof createLodgingSchema>

export const createLodgingDefaultValues: CreateLodgingSchemaType = {
  name: "",
  monthlyPrice: "",
}

export const editLodgingSchema = createLodgingSchema.extend({
  lodgingId: z.uuid("Invalid lodging id"),
  status: z.enum(lodgingStatusValues, {
    message: "Invalid lodging plan status",
  }),
})

export type EditLodgingSchemaType = z.infer<typeof editLodgingSchema>

export const deleteLodgingSchema = z.object({
  lodgingId: z.uuid("Invalid lodging id"),
})

export type DeleteLodgingSchemaType = z.infer<typeof deleteLodgingSchema>
