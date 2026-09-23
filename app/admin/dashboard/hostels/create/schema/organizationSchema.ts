import z from "zod"

export const createOrgSchema = z
  .object({
    // Org
    orgName: z.string().min(3, "Hostel name must be at least 3 characters"),
    location: z.string().optional(),

    // Owner
    ownerFullName: z.string().min(2, "Owner name is required"),
    ownerEmail: z.email("Invalid email address"),
    ownerPhone: z
      .string()
      .min(10, "Phone number must be at least 10 characters"),
    ownerUsername: z
      .string()
      .min(8, "Username must be at least 8 characters")
      .max(15, "Username must be less than 15 characters"),
    ownerPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.ownerPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type CreateOrgSchemaType = z.infer<typeof createOrgSchema>

export const createOrgWithExistingUserSchema = z.object({
  // Org
  orgName: z.string().min(3, "Hostel name must be at least 3 characters"),
  location: z.string().optional(),

  // Owner
  ownerUsername: z.string().min(1, "Username is required"),
})

export type CreateOrgWithExistingUserSchemaType = z.infer<
  typeof createOrgWithExistingUserSchema
>
