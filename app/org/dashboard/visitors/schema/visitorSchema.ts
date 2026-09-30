import z from "zod"

export const checkinVisitorSchema = z.object({
  visitorName: z
    .string()
    .trim()
    .min(1, "Visitor name is required")
    .max(255, "Visitor name must be less than 255 characters"),
  relation: z
    .string()
    .trim()
    .min(1, "Relation is required")
    .max(100, "Relation must be less than 100 characters"),
  age: z
    .number({ message: "Age must be a number" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(150, "Age looks invalid")
    .nullable()
    .optional(),
  expectedVisitDuration: z
    .string()
    .trim()
    .max(100, "Expected duration must be less than 100 characters")
    .optional(),
  studentId: z.uuid("Please select a student"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(1000, "Reason must be less than 1000 characters"),
})

export type CheckinVisitorSchemaType = z.infer<typeof checkinVisitorSchema>

export const checkinVisitorDefaultValues: CheckinVisitorSchemaType = {
  visitorName: "",
  relation: "",
  age: null,
  expectedVisitDuration: "",
  studentId: "",
  reason: "",
}

export const checkoutVisitorSchema = z.object({
  id: z.uuid("Invalid visitor id"),
})

export type CheckoutVisitorSchemaType = z.infer<typeof checkoutVisitorSchema>

export const deleteVisitorSchema = z.object({
  id: z.uuid("Invalid visitor id"),
})

export type DeleteVisitorSchemaType = z.infer<typeof deleteVisitorSchema>

export const visitorFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  perpage: z.string().optional(),
  page: z.string().optional(),
})

export type VisitorFilterProps = z.infer<typeof visitorFilterSchema>
