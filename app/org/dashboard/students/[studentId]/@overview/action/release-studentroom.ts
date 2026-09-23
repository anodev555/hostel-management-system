"use server"
import db from "@/db"
import { student, studentRoomAssignment } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import z from "zod"
import { eq, and, isNull } from "drizzle-orm"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
type ReleaseStudentActionProps = {
  studentId: string
}

export const releaseStudentAction = withAuth<
  ReleaseStudentActionProps,
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
        message: "No organization found",
      }
    }

    const parsedData = z
      .object({
        studentId: z.uuid(),
      })
      .safeParse(data)

    if (!parsedData.success) {
      return {
        success: false,
        message: "Invalid data",
      }
    }

    const { studentId } = parsedData.data

    const [existingStudent] = await db
      .select({ id: student.id })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!existingStudent) {
      return {
        success: false,
        message: "Student not found",
      }
    }

    const [roomAssignment] = await db
      .select({ id: studentRoomAssignment.id })
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.studentId, existingStudent.id),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )
      .limit(1)

    if (!roomAssignment) {
      return {
        success: false,
        message: "Student is not assigned to a room",
      }
    }

    const endDate = format(new Date(), "yyyy-MM-dd")

    const [released] = await db
      .update(studentRoomAssignment)
      .set({
        status: "released",
        endDate: endDate,
        releasedAt: new Date(),
        releasedBy: session.user.id,
      })
      .where(
        and(
          eq(studentRoomAssignment.id, roomAssignment.id),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.studentId, existingStudent.id),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )
      .returning({ id: studentRoomAssignment.id })

    if (!released) {
      return { success: false, message: "Student was already released" }
    }

    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students`)

    return {
      success: true,
      message: "Student released from room",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
