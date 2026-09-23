import z from "zod"
const wardSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Ward must be a whole number")
  .refine((value) => Number(value) >= 1, "Ward must be at least 1")

export const studentAddressSchema = z.object({
  province: z
    .string()
    .trim()
    .min(1, "Province is required")
    .max(100, "Province must be at most 100 characters"),
  district: z
    .string()
    .trim()
    .min(1, "District is required")
    .max(100, "District must be at most 100 characters"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters"),
  municipality: z
    .string()
    .trim()
    .min(1, "Municipality is required")
    .max(100, "Municipality must be at most 100 characters"),
  ward: wardSchema,
})

export type StudentAddressSchemaType = z.infer<typeof studentAddressSchema>

export const studentAddressDefaultValues: StudentAddressSchemaType = {
  province: "",
  district: "",
  city: "",
  municipality: "",
  ward: "",
}

export const studentAddressFieldKeys = Object.keys(
  studentAddressDefaultValues
) as (keyof StudentAddressSchemaType)[]
