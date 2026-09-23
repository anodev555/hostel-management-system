import z from "zod"

const amountSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")

export const staffSalaryStatusValues = ["active", "inactive"] as const

export const staffSalarySchema = z.object({
  staffId: z.string().min(1, "Staff id is required"),
  monthlyAmount: amountSchema,
})

export type StaffSalarySchemaType = z.infer<typeof staffSalarySchema>

export function staffSalaryDefaultValues(
  staffId: string
): StaffSalarySchemaType {
  return {
    staffId,
    monthlyAmount: "",
  }
}
