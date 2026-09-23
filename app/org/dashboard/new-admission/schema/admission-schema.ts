import z from "zod"

import {
  studentProfileDefaultValues,
  studentProfileSchema,
} from "./student-profile"
import {
  studentFoodAndRoomDefaultValues,
  studentFoodAndRoomSchema,
} from "./student-foodandroom"
import {
  studentTuitionDefaultValues,
  studentTuitionSchema,
} from "./student-tuition"
import type { DefaultValues } from "react-hook-form"
import {
  studentAddressDefaultValues,
  studentAddressSchema,
} from "./student-address"
import {
  studentParentDetailsDefaultValues,
  studentParentDetailsSchema,
} from "./student-parentdetails"

export const createAdmissionSchema = studentProfileSchema
  .extend(studentFoodAndRoomSchema.shape)
  .extend(studentTuitionSchema.shape)
  .extend(studentAddressSchema.shape)
  .extend(studentParentDetailsSchema.shape)

export type AdmissionFormType = z.infer<typeof createAdmissionSchema>

export const createAdmissionDefaultValues = {
  ...studentProfileDefaultValues,
  ...studentFoodAndRoomDefaultValues,
  ...studentTuitionDefaultValues,
  ...studentAddressDefaultValues,
  ...studentParentDetailsDefaultValues,
} as DefaultValues<AdmissionFormType>
