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

const dateStringSchema = z
  .string()
  .trim()
  .min(1, "Date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")

const wardSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Ward must be a whole number")
  .refine((value) => Number(value) >= 1, "Ward must be at least 1")

export const genderValues = ["male", "female", "other"] as const

export const PROFILE_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const PROFILE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"

export const profileImageSchema = z
  .file({ message: "Profile image is required" })
  .max(PROFILE_IMAGE_MAX_SIZE_BYTES, "Image must be 1MB or less")
  .mime(
    ["image/jpeg", "image/png", "image/jpg"],
    "Only JPG, JPEG, and PNG images are allowed"
  )

export const studentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(255, "Full name must be at most 255 characters"),
  email: z.email("Invalid email address"),
  studentPhone: phoneSchema,
  collegeOrSchool: z
    .string()
    .trim()
    .min(1, "College or school is required")
    .max(255, "College or school must be at most 255 characters"),
  course: z
    .string()
    .trim()
    .min(1, "Course is required")
    .max(255, "Course must be at most 255 characters"),
  profileImage: profileImageSchema,

  dateOfBirth: z.date("Date of birth is required"),
  addmissionDate: z.date("Admission date is required"),
  addmissionNumber: z
    .string()
    .trim()
    .min(1, "Admission number is required")
    .max(50, "Admission number must be at most 50 characters"),
  gender: z.enum(genderValues, {
    message: "Invalid gender",
  }),
})

export type StudentProfileSchemaType = z.infer<typeof studentProfileSchema>

export const studentProfileDefaultValues = {
  fullName: "",
  email: "",
  studentPhone: "",
  collegeOrSchool: "",
  course: "",
  profileImage: undefined,

  dateOfBirth: new Date(),
  addmissionDate: new Date(),
  addmissionNumber: "",
  gender: "male" as const,
}

export const studentProfileFieldKeys = Object.keys(
  studentProfileDefaultValues
) as (keyof StudentProfileSchemaType)[]
