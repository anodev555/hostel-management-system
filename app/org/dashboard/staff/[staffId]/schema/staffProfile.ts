import z from "zod"

export const staffProfileSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("invalid email address"),
  username: z
    .string()
    .trim()
    .min(8, "Username must be at least 8 characters")
    .max(15, "Username must be less than 15 characters "),
  contactPhone: z
    .string()
    .trim()
    .refine((value) => value === "" || value.length >= 10, {
      message: "Contact phone must be at least 10 characters",
    }),
  role: z.string().min(1, "Role is required"),
})

export type StaffProfileSchemaType = z.infer<typeof staffProfileSchema>
