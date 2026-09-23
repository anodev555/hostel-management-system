import z from "zod"

export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required").trim(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .trim()
    .refine(
      (value) => {
        const n = Number(value)
        return Number.isFinite(n) && n > 0
      },
      {
        message: "Amount must be greater than 0",
      }
    ),
  method: z.enum([
    "cash",
    "cheque",
    "bank_transfer",
    "esewa",
    "khalti",
    "other",
  ]),
  reference: z
    .string()
    .min(1, "Reference is required")
    .max(255, "Reference must be less than 255 characters")
    .trim(),
  notes: z
    .string()
    .max(255, "Notes must be less than 255 characters")
    .trim()
    .optional(),
  recievedBy: z
    .string()
    .min(1, "Recieved by is required")
    .max(255, "Recieved by must be less than 255 characters")
    .trim(),
})

export type PaymentSchemaType = z.infer<typeof paymentSchema>

export const paymentSchemaDefaultValues: Omit<
  PaymentSchemaType,
  "studentId"
> & { studentId: string } = {
  studentId: "",
  amount: "",
  method: "cash",
  reference: "",
  notes: "",
  recievedBy: "",
}

export const paymentSchemaFieldKeys = Object.keys(
  paymentSchema
) as (keyof typeof paymentSchema)[]
