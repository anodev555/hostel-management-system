"use server"

import db from "@/db"
import {
  student,
  studentTuitionAssignment,
  tuitionPlan,
  tuitionTeacher,
} from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { format } from "date-fns"
import { eq, and, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import z from "zod"
import {
  studentTuitionSchema,
  StudentTuitionSchemaType,
} from "../../schema/student-roomfoodtuition"
type ReleaseTuitionActionProps = {
  studentId: string
}

export const releaseTuitionAction = withAuth<
  ReleaseTuitionActionProps,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization found" }
    }

    const parsedData = z
      .object({
        studentId: z.uuid(),
      })
      .safeParse(data)

    if (!parsedData.success) {
      return { success: false, message: "Invalid data" }
    }
    const { studentId } = parsedData.data

    //check student
    const [studentRow] = await db
      .select({ id: student.id })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow) {
      return { success: false, message: "Student not found" }
    }

    //find active tuition assignment
    const [tuitionAssignmentRow] = await db
      .select()
      .from(studentTuitionAssignment)
      .where(
        and(
          eq(studentTuitionAssignment.studentId, studentRow.id),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "assigned"),
          isNull(studentTuitionAssignment.endDate)
        )
      )
      .limit(1)

    if (!tuitionAssignmentRow) {
      return {
        success: false,
        message: "Student has no active tuition assignment",
      }
    }

    const endDate = format(new Date(), "yyyy-MM-dd")
    const [released] = await db
      .update(studentTuitionAssignment)
      .set({
        status: "released",
        endDate,
        releasedAt: new Date(),
        releasedBy: session.user.id,
      })
      .where(
        and(
          eq(studentTuitionAssignment.id, tuitionAssignmentRow.id),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.studentId, studentRow.id),
          eq(studentTuitionAssignment.status, "assigned"),
          isNull(studentTuitionAssignment.endDate)
        )
      )
      .returning({ id: studentTuitionAssignment.id })

    if (!released) {
      return {
        success: false,
        message: "Failed to release tuition assignment",
      }
    }

    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students/`)

    return {
      success: true,
      message: "Tuition plan removed",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong!" }
  }
})

export const assignTuitionAction = withAuth<
  StudentTuitionSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization found" }
    }

    const parsedData = studentTuitionSchema.safeParse(data)
    if (!parsedData.success) {
      return { success: false, message: "Invalid data" }
    }
    const { studentId, tuitionPlanId } = parsedData.data

    //check student
    const [studentRow] = await db
      .select({ id: student.id })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow) {
      return { success: false, message: "Student not found" }
    }

    //check if student has active tuition assignment
    const [activeTuitionAssignmentRow] = await db
      .select({ id: studentTuitionAssignment.id })
      .from(studentTuitionAssignment)
      .where(
        and(
          eq(studentTuitionAssignment.studentId, studentRow.id),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "assigned"),
          isNull(studentTuitionAssignment.endDate)
        )
      )
      .limit(1)

    if (activeTuitionAssignmentRow) {
      return {
        success: false,
        message:
          "Student already has an active tuition assignment! Please release the existing assignment first.",
      }
    }

    const [tuitionPlanRow] = await db
      .select({ id: tuitionPlan.id, monthlyPrice: tuitionPlan.monthlyPrice })
      .from(tuitionPlan)
      .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .where(
        and(
          eq(tuitionPlan.id, tuitionPlanId),
          eq(tuitionPlan.organizationId, organizationId),
          eq(tuitionPlan.status, "active"),
          eq(tuitionTeacher.organizationId, organizationId)
        )
      )
      .limit(1)
    if (!tuitionPlanRow) {
      return {
        success: false,
        message: "Tuition plan not available",
        fieldErrors: {
          tuitionPlanId: ["Selected tuition plan is not available"],
        },
      }
    }

    await db.insert(studentTuitionAssignment).values({
      organizationId: organizationId,
      studentId: studentRow.id,
      tuitionPlanId: tuitionPlanRow.id,
      tuitionAmount: tuitionPlanRow.monthlyPrice,
      startDate: format(new Date(), "yyyy-MM-dd"),
      status: "assigned",
      assignedBy: session.user.id,
    })

    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students/`)

    return {
      success: true,
      message: "Tuition plan assigned!",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong!" }
  }
})
