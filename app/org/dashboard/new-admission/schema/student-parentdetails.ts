import z from "zod"
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 characters")
  .max(15, "Phone number must be at most 15 characters")

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (value.length >= 10 && value.length <= 15),
    {
      message: "Phone number must be between 10 and 15 characters",
    }
  )

export const studentParentDetailsSchema = z.object({
  fatherName: z
    .string()
    .trim()
    .min(1, "Father's name is required")
    .max(255, "Father's name must be at most 255 characters"),
  motherName: z
    .string()
    .trim()
    .min(1, "Mother's name is required")
    .max(255, "Mother's name must be at most 255 characters"),
  guardianPhone1: phoneSchema,
  guardianPhone2: optionalPhoneSchema,
})

export type StudentParentDetailsSchemaType = z.infer<
  typeof studentParentDetailsSchema
>

export const studentParentDetailsDefaultValues: StudentParentDetailsSchemaType =
  {
    fatherName: "",
    motherName: "",
    guardianPhone1: "",
    guardianPhone2: "",
  }

export const studentParentDetailsFieldKeys = Object.keys(
  studentParentDetailsDefaultValues
) as (keyof StudentParentDetailsSchemaType)[]
