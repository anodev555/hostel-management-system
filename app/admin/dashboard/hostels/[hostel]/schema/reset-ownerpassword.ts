import z from "zod"

export const ownerResetPasswordSchema = z
  .object({
    ownerId: z.string().min(1, "Owner ID is required"),
    hostelId: z.string().min(1, "Hostel ID is required"),
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

export type OwnerResetPasswordSchemaType = z.infer<typeof ownerResetPasswordSchema>