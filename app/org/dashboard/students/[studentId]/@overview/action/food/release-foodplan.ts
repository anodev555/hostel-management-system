"use server"

import db from "@/db"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { revalidatePath } from "next/cache"
import { student, studentFoodAssignment } from "@/db/schema"
import { and, isNull } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { format } from "date-fns"
import z from "zod"
type ReleaseFoodPlanActionProps = {
  studentId: string
}

export const releaseFoodPlanAction = withAuth<
  ReleaseFoodPlanActionProps,
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
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const parsed = z.object({ studentId: z.uuid() }).safeParse(data)
    if (!parsed.success) {
      return { success: false, message: "Invalid data" }
    }
    const { studentId } = parsed.data

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
      return {
        success: false,
        message: "Student not found",
      }
    }

    const [foodAssignment] = await db
      .select({ id: studentFoodAssignment.id })
      .from(studentFoodAssignment)
      .where(
        and(
          eq(studentFoodAssignment.studentId, studentRow.id),
          eq(studentFoodAssignment.organizationId, organizationId),
          eq(studentFoodAssignment.status, "assigned"),
          isNull(studentFoodAssignment.endDate)
        )
      )
      .limit(1)

    if (!foodAssignment) {
      return { success: false, message: "Student has no active food plan" }
    }
    const endDate = format(new Date(), "yyyy-MM-dd")
    const [released] = await db
      .update(studentFoodAssignment)
      .set({
        status: "released",
        endDate,
        releasedAt: new Date(),
        releasedBy: session.user.id,
      })
      .where(
        and(
          eq(studentFoodAssignment.id, foodAssignment.id),
          eq(studentFoodAssignment.organizationId, organizationId),
          eq(studentFoodAssignment.studentId, studentRow.id),
          eq(studentFoodAssignment.status, "assigned"),
          isNull(studentFoodAssignment.endDate)
        )
      )
      .returning({ id: studentFoodAssignment.id })
    if (!released) {
      return { success: false, message: "Food plan was already removed" }
    }
    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students`)
    return { success: true, message: "Food plan removed", data: null }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong!",
    }
  }
})
