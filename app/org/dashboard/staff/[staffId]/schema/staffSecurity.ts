import z from "zod"

export const staffSecuritySchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    staffId: z.string().min(1, "Staff ID is required"), //member id (for org scope)
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters")
      .max(20, "Confirm password must be less than 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type StaffSecuritySchemaType = z.infer<typeof staffSecuritySchema>
