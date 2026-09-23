import z from "zod"

const LOGO_MAX_SIZE = 1024 * 1024 * 5
const LOGO_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"]

export const orgProfileLogoSchema = z.object({
  orgProfileLogo: z
    .instanceof(File, { message: "Please select a logo" })
    .refine((file) => file.size <= LOGO_MAX_SIZE, {
      message: "Logo must be less than 5MB",
    })
    .refine((file) => LOGO_ALLOWED_TYPES.includes(file.type), {
      message: "Logo must be a PNG, JPEG, or JPG image",
    }),
})

export type OrgProfileLogoType = z.infer<typeof orgProfileLogoSchema>

export const orgProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  location: z
    .string()
    .trim()
    .min(1, { message: "Location is required" })
    .max(100, { message: "Location must be less than 100 characters" }),
})

export type OrgProfileType = z.infer<typeof orgProfileSchema>

export const profileFormSchemaDefaultValues: OrgProfileType = {
  name: "",
  location: "",
}
