import z from "zod"
const salarySchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places"
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0")
export const createStaffSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    salary: salarySchema,
    email: z.email("Invalid email address"),
    contactPhone: z
      .string()
      .trim()
      .refine((value) => value === "" || value.length >= 10, {
        message: "Phone number must be at least 10 characters",
      }),
    username: z
      .string()
      .min(8, "Username must be at least 8 characters")
      .max(15, "Username must be less than 15 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters"),
    confirmPassword: z.string(),
    role: z.string().min(1, "Role is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type CreateStaffSchemaType = z.infer<typeof createStaffSchema>
