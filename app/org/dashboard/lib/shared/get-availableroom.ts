"use server"

import { and, asc, eq, isNull } from "drizzle-orm"

import db from "@/db"
import { lodgingPlan, room, studentRoomAssignment } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { AvailableBed, AvailableRoomOption } from "@/types/room-type"

function buildAllBeds(totalBeds: number): AvailableBed[] {
  return Array.from({ length: totalBeds }, (_, i) => ({
    bedNumber: i + 1,
  }))
}
function bedKey(bedNumber: number) {
  return String(bedNumber)
}
export const getAvailableRoomsAction = withAuth<
  void,
  ActionResponse<AvailableRoomOption[]>
>({
  roles: ["orgUser"],
  permissionsAny: [{ student: ["create"] }, { student: ["update"] }],
  requireActiveOrg: true,
})(async ({
  organizationId,
}): Promise<ActionResponse<AvailableRoomOption[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const [activeRooms, activeAssignments] = await Promise.all([
      db
        .select({
          id: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          totalBeds: room.totalBeds,
          attachedBathroom: room.attachedBathroom,
          airConditioner: room.airConditioner,
          lodgingPlanId: room.lodgingPlanId,
          lodgingPlanName: lodgingPlan.name,
          monthlyPrice: lodgingPlan.monthlyPrice,
        })
        .from(room)
        .innerJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
        .where(
          and(
            eq(room.organizationId, organizationId),
            eq(room.status, "active"),
            eq(lodgingPlan.status, "active")
          )
        )
        .orderBy(asc(room.roomNumber)),

      db
        .select({
          roomId: studentRoomAssignment.roomId,

          bedNumber: studentRoomAssignment.bedNumber,
        })
        .from(studentRoomAssignment)
        .where(
          and(
            eq(studentRoomAssignment.organizationId, organizationId),
            eq(studentRoomAssignment.status, "assigned"),
            isNull(studentRoomAssignment.endDate)
          )
        ),
    ])

    const occupiedByRoom = new Map<string, Set<number>>()

    for (const assignment of activeAssignments) {
      const occupied =
        occupiedByRoom.get(assignment.roomId) ?? new Set<number>()
      occupied.add(assignment.bedNumber)
      occupiedByRoom.set(assignment.roomId, occupied)
    }

    const availableRooms: AvailableRoomOption[] = activeRooms.map((item) => {
      const allBeds = buildAllBeds(item.totalBeds)
      const occupied = occupiedByRoom.get(item.id) ?? new Set<number>()
      const availableBeds = allBeds.filter(
        (bed) => !occupied.has(bed.bedNumber)
      )
      const occupiedCount = allBeds.length - availableBeds.length

      return {
        id: item.id,
        roomNumber: item.roomNumber,
        floor: item.floor,
        totalBeds: item.totalBeds,
        occupiedCount,
        availableCount: availableBeds.length,
        isFull: availableBeds.length === 0,
        attachedBathroom: item.attachedBathroom,
        airConditioner: item.airConditioner,
        lodgingPlanId: item.lodgingPlanId,
        lodgingPlanName: item.lodgingPlanName,
        monthlyPrice: item.monthlyPrice,
        availableBeds,
      }
    })

    return {
      success: true,
      message: "Available rooms fetched successfully",
      data: availableRooms,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch available rooms",
    }
  }
})
