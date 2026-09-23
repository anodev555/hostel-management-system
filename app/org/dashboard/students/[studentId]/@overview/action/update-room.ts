"use server"

import { lodgingPlan, room, student, studentRoomAssignment } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import {
  studentRoomSchema,
  StudentRoomSchemaType,
} from "../schema/student-roomfoodtuition"
import { ActionResponse } from "@/types/action-response"
import z from "zod"
import db from "@/db"
import { and, eq, isNull } from "drizzle-orm"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"

export const updateRoomAction = withAuth<
  StudentRoomSchemaType,
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
    // parsed data validation
    const parsedData = studentRoomSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    //check if student exists within org

    const [isStudentExists] = await db
      .select({
        id: student.id,
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
        message: "Student not found",
      }
    }

    ///reject if student is already assigned to a room
    const [isStudentAssignedToRoom] = await db
      .select()
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.studentId, isStudentExists.id),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )
      .limit(1)

    if (isStudentAssignedToRoom) {
      return {
        success: false,
        message:
          "Student is already assigned to a room! Please release the room first or assign a different room",
      }
    }

    //verify room exists
    const [isRoomExists] = await db
      .select({
        id: room.id,
        totalBeds: room.totalBeds,
        monthlyPrice: lodgingPlan.monthlyPrice,
      })
      .from(room)
      .innerJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
      .where(
        and(
          eq(room.id, parsedData.data.roomId),
          eq(room.organizationId, organizationId),
          eq(room.status, "active"),
          eq(lodgingPlan.status, "active")
        )
      )
      .limit(1)

    if (!isRoomExists) {
      return {
        success: false,
        message: "Room not available. Please check room availability",
        fieldErrors: {
          roomId: ["Selected room is not available"],
        },
      }
    }

    //verify bed number is available
    const bedNumber = Number(parsedData.data.bedNumber)
    if (bedNumber < 1 || bedNumber > isRoomExists.totalBeds) {
      return {
        success: false,
        message: `Invalid bed number for this room (max: ${isRoomExists.totalBeds})`,
        fieldErrors: {
          bedNumber: [
            `Must be between 1 and ${isRoomExists.totalBeds} for this room`,
          ],
        },
      }
    }

    //verify bed not already taken

    const [bedTaken] = await db
      .select({ id: studentRoomAssignment.id })
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.roomId, isRoomExists.id),
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
    //update student room assignment

    await db.insert(studentRoomAssignment).values({
      organizationId: organizationId,
      studentId: isStudentExists.id,
      roomId: isRoomExists.id,
      bedNumber: bedNumber,
      lodgingAmount: isRoomExists.monthlyPrice,
      status: "assigned",
      startDate: format(new Date(), "yyyy-MM-dd"),
      assignedBy: session.user.id,
    })

    revalidatePath(`/org/dashboard/students/${isStudentExists.id}`)
    revalidatePath(`/org/dashboard/students`)
    return {
      success: true,
      message: "Room assigned successfully",
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
