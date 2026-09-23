"use server"

import { format } from "date-fns"
import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import z from "zod"

import db from "@/db"
import {
  foodplan,
  lodgingPlan,
  room,
  student,
  studentFoodAssignment,
  studentRoomAssignment,
  studentTuitionAssignment,
  tuitionPlan,
  tuitionTeacher,
} from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { deleteFile } from "@/utils/delete-file"
import { uploadImage, UploadValidationError } from "@/utils/upload-file"

import {
  AdmissionFormType,
  createAdmissionSchema,
} from "../schema/admission-schema"
import { PROFILE_IMAGE_MAX_SIZE_BYTES } from "../schema/student-profile"

const PROFILE_IMAGE_FOLDER = "public/uploads/student-profile-images"
const PROFILE_IMAGE_MIME = ["image/jpeg", "image/png", "image/jpg"] as const

function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export const createStudentAction = withAuth<
  AdmissionFormType,
  ActionResponse<{ studentId: string }>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["create"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
}): Promise<ActionResponse<{ studentId: string }>> => {
  let uploadedProfilePath: string | undefined

  try {
    // Step 1: Organization check
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    // Step 2: Parse & validate form data
    const parsedData = createAdmissionSchema.safeParse(data)

    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const formData = parsedData.data

    // Step 3: Check duplicate admission number
    const [existingStudent] = await db
      .select({ id: student.id })
      .from(student)
      .where(
        and(
          eq(student.addmissionNumber, formData.addmissionNumber),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (existingStudent) {
      return {
        success: false,
        message: "Student with this admission number already exists",
        fieldErrors: {
          addmissionNumber: ["This admission number is already in use"],
        },
      }
    }

    // Step 4: Verify room + active lodging plan
    const [roomRow] = await db
      .select({
        id: room.id,
        totalBeds: room.totalBeds,
        monthlyPrice: lodgingPlan.monthlyPrice,
      })
      .from(room)
      .innerJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
      .where(
        and(
          eq(room.organizationId, organizationId),
          eq(room.id, formData.roomId),
          eq(room.status, "active"),
          eq(lodgingPlan.status, "active")
        )
      )
      .limit(1)

    if (!roomRow) {
      return {
        success: false,
        message: "Room not available. Please check room availability",
        fieldErrors: {
          roomId: ["Selected room is not available"],
        },
      }
    }

    // Step 5: Validate bed number range
    const bedNumber = Number(formData.bedNumber)
    if (bedNumber < 1 || bedNumber > roomRow.totalBeds) {
      return {
        success: false,
        message: `Invalid bed number for this room (max: ${roomRow.totalBeds})`,
        fieldErrors: {
          bedNumber: [
            `Must be between 1 and ${roomRow.totalBeds} for this room`,
          ],
        },
      }
    }

    // Step 6: Check bed not already taken
    const [bedTaken] = await db
      .select({ id: studentRoomAssignment.id })
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.roomId, formData.roomId),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.bedNumber, bedNumber),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )
      .limit(1)

    if (bedTaken) {
      return {
        success: false,
        message: "Bed already taken! Please choose another bed",
        fieldErrors: {
          bedNumber: ["This bed is already assigned"],
        },
      }
    }

    // Step 7: Verify active food plan
    const [foodPlanRow] = await db
      .select({
        id: foodplan.id,
        monthlyPrice: foodplan.monthlyPrice,
      })
      .from(foodplan)
      .where(
        and(
          eq(foodplan.organizationId, organizationId),
          eq(foodplan.status, "active"),
          eq(foodplan.id, formData.foodPlanId)
        )
      )
      .limit(1)

    if (!foodPlanRow) {
      return {
        success: false,
        message: "Food plan not available. Please select an active food plan",
        fieldErrors: {
          foodPlanId: ["Selected food plan is not available"],
        },
      }
    }

    let tuitionPlanRow: { id: string; monthlyPrice: string } | undefined

    if (formData.wantsTuition) {
      const [planRow] = await db
        .select({
          id: tuitionPlan.id,
          monthlyPrice: tuitionPlan.monthlyPrice,
        })
        .from(tuitionPlan)
        .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
        .where(
          and(
            eq(tuitionPlan.organizationId, organizationId),
            eq(tuitionPlan.status, "active"),
            eq(tuitionPlan.id, formData.tuitionPlanId)
          )
        )
        .limit(1)

      if (!planRow) {
        return {
          success: false,
          message: "Tuition plan not available. Please select an active plan",
          fieldErrors: {
            tuitionPlanId: ["Selected tuition plan is not available"],
          },
        }
      }

      tuitionPlanRow = planRow
    }

    // Step 8: Upload profile image (after all checks pass)
    const { relativePath } = await uploadImage(
      formData.profileImage,
      PROFILE_IMAGE_FOLDER,
      {
        maxSizeBytes: PROFILE_IMAGE_MAX_SIZE_BYTES,
        allowedMimeTypes: PROFILE_IMAGE_MIME,
      }
    )
    uploadedProfilePath = relativePath

    // Step 9: Insert student + room, food & tuition assignments in one transaction
    const studentId = await db.transaction(async (tx) => {
      const [studentRow] = await tx
        .insert(student)
        .values({
          organizationId,
          fullName: formData.fullName,
          email: formData.email,
          studentPhone: formData.studentPhone,
          collegeOrSchool: formData.collegeOrSchool,
          course: formData.course,
          profileImage: relativePath,
          province: formData.province,
          district: formData.district,
          city: formData.city,
          municipality: formData.municipality,
          ward: Number(formData.ward),
          dateOfBirth: toDateString(formData.dateOfBirth),
          addmissionDate: toDateString(formData.addmissionDate),
          addmissionNumber: formData.addmissionNumber,
          gender: formData.gender,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          guardianPhone1: formData.guardianPhone1,
          guardianPhone2: formData.guardianPhone2 || null,
          status: "active",
          createdBy: session.user.id,
        })
        .returning({ id: student.id })

      if (!studentRow) {
        throw new Error("Failed to create student")
      }

      const startDate = toDateString(formData.addmissionDate)

      await tx.insert(studentRoomAssignment).values({
        organizationId,
        studentId: studentRow.id,
        roomId: formData.roomId,
        bedNumber,
        lodgingAmount: roomRow.monthlyPrice,
        status: "assigned",
        startDate,
        assignedBy: session.user.id,
      })

      await tx.insert(studentFoodAssignment).values({
        organizationId,
        studentId: studentRow.id,
        foodPlanId: formData.foodPlanId,
        foodAmount: foodPlanRow.monthlyPrice,
        status: "assigned",
        startDate,
        assignedBy: session.user.id,
      })

      if (formData.wantsTuition && tuitionPlanRow) {
        await tx.insert(studentTuitionAssignment).values({
          organizationId,
          studentId: studentRow.id,
          tuitionPlanId: tuitionPlanRow.id,
          tuitionAmount: tuitionPlanRow.monthlyPrice,
          status: "assigned",
          startDate,
          assignedBy: session.user.id,
        })
      }

      return studentRow.id
    })

    // Step 10: Revalidate & return success
    revalidatePath("/org/dashboard/new-admission")
    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students`)

    return {
      success: true,
      message: "Student admitted successfully",
      data: { studentId },
    }
  } catch (error) {
    console.error(error)

    if (uploadedProfilePath) {
      await deleteFile(uploadedProfilePath).catch(console.error)
    }

    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23505") {
      const message = error instanceof Error ? error.message : ""

      if (
        message.includes("student_addmissionNumber") ||
        message.includes("addmissionNumber")
      ) {
        return {
          success: false,
          message: "Student with this admission number already exists",
          fieldErrors: {
            addmissionNumber: ["This admission number is already in use"],
          },
        }
      }

      if (message.includes("uniq_active_room_bed")) {
        return {
          success: false,
          message: "Bed already taken! Please choose another bed",
          fieldErrors: {
            bedNumber: ["This bed was just assigned to another student"],
          },
        }
      }

      return {
        success: false,
        message: "A record with these details already exists",
      }
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
      message:
        error instanceof Error ? error.message : "Failed to create student",
    }
  }
})
