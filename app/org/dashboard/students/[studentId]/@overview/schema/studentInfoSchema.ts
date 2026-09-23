import z from "zod"

import { genderEnum, studentStatusEnum } from "@/db/schema/student-schema"

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 characters")
  .max(15, "Phone number must be at most 15 characters")

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || value.length == 10, {
    message: "Phone number must be  10 digits",
  })

const wardSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Ward must be a whole number")
  .refine((value) => Number(value) >= 1, "Ward must be at least 1")

export const genderValues = genderEnum.enumValues
export const studentStatusValues = studentStatusEnum.enumValues

export const PROFILE_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const PROFILE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"

/** Optional on update — omit or leave undefined to keep the existing image */
export const editProfileImageSchema = z
  .file({ message: "Invalid profile image" })
  .max(PROFILE_IMAGE_MAX_SIZE_BYTES, "Image must be 5MB or less")
  .mime(
    ["image/jpeg", "image/png", "image/jpg"],
    "Only JPG, JPEG, and PNG images are allowed"
  )
  .optional()

export const editStudentInfoSchema = z.object({
  studentId: z.uuid("Invalid student id"),

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
  profileImage: editProfileImageSchema,

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

  dateOfBirth: z.date("Date of birth is required"),

  gender: z.enum(genderValues, {
    message: "Invalid gender",
  }),
  status: z.enum(studentStatusValues, {
    message: "Invalid status",
  }),

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

export type StudentInfoSchemaType = z.infer<typeof editStudentInfoSchema>

export const studentInfoDefaultValues: Omit<
  StudentInfoSchemaType,
  "studentId"
> & { studentId: string } = {
  studentId: "",
  fullName: "",
  email: "",
  studentPhone: "",
  collegeOrSchool: "",
  course: "",
  profileImage: undefined,
  province: "",
  district: "",
  city: "",
  municipality: "",
  ward: "",
  dateOfBirth: new Date(),
  gender: "male",
  status: "active",
  fatherName: "",
  motherName: "",
  guardianPhone1: "",
  guardianPhone2: "",
}

export const studentInfoFieldKeys = Object.keys(
  studentInfoDefaultValues
) as (keyof typeof studentInfoDefaultValues)[]
