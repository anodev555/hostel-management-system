"use server"

import { withAuth } from "@/lib/withAuth"
import {
  editStudentInfoSchema,
  StudentInfoSchemaType,
} from "../schema/studentInfoSchema"
import { ActionResponse } from "@/types/action-response"

import db from "@/db"
import { student } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { uploadImage, UploadValidationError } from "@/utils/upload-file"
import { deleteFile } from "@/utils/delete-file"
import { revalidatePath } from "next/cache"
import z from "zod"
import { format } from "date-fns"

export const updateStudentInfoAction = withAuth<
  StudentInfoSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  let uploadedProfileImagePath: string | undefined
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const parsedData = editStudentInfoSchema.safeParse(data)

    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    //check if student exists with in org
    const [isStudentExists] = await db
      .select({
        id: student.id,
        profileImage: student.profileImage,
      })
      .from(student)
      .where(
        and(
          eq(student.id, parsedData.data.studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!isStudentExists) {
      return {
        success: false,
        message: "Student not found!",
      }
    }

    let profileImagePath = isStudentExists.profileImage

    if (parsedData.data.profileImage) {
      const { relativePath } = await uploadImage(
        parsedData.data.profileImage,
        "public/uploads/student-profile-images",
        {
          maxSizeBytes: 1024 * 1024 * 5,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        }
      )

      uploadedProfileImagePath = relativePath
      profileImagePath = relativePath
    }

    const updated = await db
      .update(student)
      .set({
        fullName: parsedData.data.fullName,
        email: parsedData.data.email,
        studentPhone: parsedData.data.studentPhone,
        collegeOrSchool: parsedData.data.collegeOrSchool,
        course: parsedData.data.course,
        profileImage: profileImagePath,
        province: parsedData.data.province,
        district: parsedData.data.district,
        city: parsedData.data.city,
        ward: Number(parsedData.data.ward),
        municipality: parsedData.data.municipality,
        dateOfBirth: format(parsedData.data.dateOfBirth, "yyyy-MM-dd"),
        gender: parsedData.data.gender,
        status: parsedData.data.status,
        fatherName: parsedData.data.fatherName,
        motherName: parsedData.data.motherName,
        guardianPhone1: parsedData.data.guardianPhone1,
        guardianPhone2: parsedData.data.guardianPhone2 || null,
      })
      .where(
        and(
          eq(student.id, parsedData.data.studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .returning({
        fullName: student.fullName,
      })

    if (!updated[0]) {
      if (uploadedProfileImagePath) {
        await deleteFile(uploadedProfileImagePath).catch((err) =>
          console.error(err)
        )
      }
      return {
        success: false,
        message: "Error in updating student!",
      }
    }

    //replace successed and remove the old photo
    if (
      uploadedProfileImagePath &&
      isStudentExists.profileImage &&
      isStudentExists.profileImage !== uploadedProfileImagePath
    ) {
      await deleteFile(isStudentExists.profileImage).catch((err) =>
        console.error(err)
      )
    }

    revalidatePath(`/org/dashboard/students/${parsedData.data.studentId}`)
    revalidatePath(`/org/dashboard/students`)

    return {
      success: true,
      message: `${updated[0].fullName} updated successfully!`,
      data: null,
    }
  } catch (error) {
    console.error(error)

    if (uploadedProfileImagePath) {
      await deleteFile(uploadedProfileImagePath).catch((err) =>
        console.error(err)
      )
    }

    if (error instanceof UploadValidationError) {
      return {
        success: false,
        message: error.message,
        fieldErrors: {
          profileImage: [error.message],
        },
      }
    }
    return {
      success: false,
      message: "Something went wrong!",
    }
  }
})
