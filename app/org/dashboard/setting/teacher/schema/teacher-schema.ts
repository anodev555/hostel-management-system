import z from "zod"

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 characters")
  .max(15, "Phone number must be at most 15 characters")

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Invalid email address"
  )
const salarySchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")

export const teacherStatusValues = ["active", "inactive"] as const

export const createTeacherSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Teacher name is required")
    .max(255, "Teacher name must be at most 255 characters"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  subject: z
    .string()
    .trim()
    .min(3, "Subject is required")
    .max(255, "Subject must be at most 255 characters"),

  address: z
    .string()
    .trim()
    .max(500, "Address must be at most 500 characters")
    .optional(),
  status: z.enum(teacherStatusValues, {
    message: "Select status",
  }),
  monthlySalary: salarySchema,
})

export type CreateTeacherSchemaType = z.infer<typeof createTeacherSchema>

export const createTeacherDefaultValues: CreateTeacherSchemaType = {
  fullName: "",
  phone: "",
  email: "",
  subject: "",
  address: "",
  status: "active",
  monthlySalary: "",
}

export const editTeacherSchema = createTeacherSchema.extend({
  teacherId: z.uuid("Invalid teacher id"),
})

export type EditTeacherSchemaType = z.infer<typeof editTeacherSchema>

export const deleteTeacherSchema = z.object({
  teacherId: z.uuid("Invalid teacher id"),
})

export type DeleteTeacherSchemaType = z.infer<typeof deleteTeacherSchema>
