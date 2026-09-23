"use server"

import db from "@/db"
import { lodgingPlan, room, student, studentRoomAssignment } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { RoomInfoWithStudents } from "@/types/room-type"
import { eq, and, desc, isNull } from "drizzle-orm"

export const getAllRoomsInfo = withAuth<
  void,
  ActionResponse<RoomInfoWithStudents[]>
>({
  roles: ["orgUser"],
  permissions: {
    room: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<RoomInfoWithStudents[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const [rooms, assignments] = await Promise.all([
      db
        .select({
          roomId: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          totalBeds: room.totalBeds,
          fans: room.fans,
          attachedBathroom: room.attachedBathroom,
          airConditioner: room.airConditioner,
          planName: lodgingPlan.name,
          monthlyPrice: lodgingPlan.monthlyPrice,
        })
        .from(room)
        .leftJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
        .where(
          and(
            eq(room.organizationId, organizationId),
            eq(room.status, "active")
          )
        )
        .orderBy(desc(room.roomNumber)),

      db
        .select({
          roomId: studentRoomAssignment.roomId,
          bedNumber: studentRoomAssignment.bedNumber,
          studentId: student.id,
          studentName: student.fullName,
          studentProfile: student.profileImage,
        })
        .from(studentRoomAssignment)
        .innerJoin(student, eq(studentRoomAssignment.studentId, student.id))
        .where(
          and(
            eq(studentRoomAssignment.organizationId, organizationId),
            eq(studentRoomAssignment.status, "assigned"),
            isNull(studentRoomAssignment.endDate)
          )
        ),
    ])
    //group the students by room
    const studentsByRoom: Record<
      string,
      {
        bedNumber: number
        studentId: string
        studentName: string
        studentProfile: string
      }[]
    > = {}

    // { we grouped the students by room like this:
    //     "room-A": [
    //       { bedNumber: 1, studentId: "...", fullName: "Ram" },
    //       { bedNumber: 2, studentId: "...", fullName: "Sita" },
    //     ],

    //   }
    for (const assignment of assignments) {
      if (!studentsByRoom[assignment.roomId]) {
        studentsByRoom[assignment.roomId] = []
      }
      studentsByRoom[assignment.roomId].push({
        bedNumber: assignment.bedNumber,
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        studentProfile: assignment.studentProfile || "",
      })
    }

    const result: RoomInfoWithStudents[] = rooms.map((room) => {
      const students = studentsByRoom[room.roomId] ?? []
      return {
        room: { ...room },
        students,
        vacantBeds: room.totalBeds - students.length,
        occupiedBeds: students.length,
      }
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
