"use server"
import { withAuth } from "@/lib/withAuth"
import {
  createRoomSchema,
  CreateRoomSchemaType,
  editRoomSchema,
  type EditRoomSchemaType,
} from "../schema/room-schema"
import { ActionResponse } from "@/types/action-response"
import { RoomItem } from "@/types/room-type"
import z from "zod"
import db from "@/db"
import { user } from "@/db/schema/auth-schema"
import { lodgingPlan, room, studentRoomAssignment } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { asc, and, eq, sql, count, isNull, max } from "drizzle-orm"
export const createRoomAction = withAuth<
  CreateRoomSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    room: ["create"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = createRoomSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    // verifying loddging plan id

    const [lodgingplan] = await db
      .select()
      .from(lodgingPlan)
      .where(
        and(
          eq(lodgingPlan.id, parsed.data.lodgingPlanId),
          eq(lodgingPlan.organizationId, organizationId),
          eq(lodgingPlan.status, "active")
        )
      )

    if (!lodgingplan) {
      return {
        success: false,
        message: "Invalid or inactive lodging plan",
        fieldErrors: {
          lodgingPlanId: ["Invalid or inactive lodging plan"],
        },
      }
    }

    //inserting room data
    await db.insert(room).values({
      roomNumber: Number(parsed.data.roomNumber),
      floor: Number(parsed.data.floor),
      fans: Number(parsed.data.fans),
      totalBeds: Number(parsed.data.totalBeds),
      attachedBathroom: Boolean(parsed.data.attachedBathroom),
      airConditioner: Boolean(parsed.data.airConditioner),
      lodgingPlanId: parsed.data.lodgingPlanId,
      organizationId: organizationId,
      createdBy: session.user.id,
    })
    revalidatePath("/org/dashboard/setting/room")
    return {
      success: true,
      message: `Room ${parsed.data.roomNumber} created successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23505") {
      return {
        success: false,
        message: "A room with this number already exists",
        fieldErrors: {
          roomNumber: ["This room number is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: "Internal server error",
    }
  }
})

//getRoomsAction

type GetRoomsProps = {
  search?: string
  page?: string
  perpage?: string
}

type GetRoomsResponse = {
  rooms: RoomItem[]
  total: number
  totalPages: number
}

type GetRoomsSchemaType = GetRoomsProps | null

export const getRoomsAction = withAuth<
  GetRoomsSchemaType,
  ActionResponse<GetRoomsResponse>
>({
  roles: ["orgUser"],
  permissions: {
    room: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetRoomsResponse>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsedPerPage = Number(data?.perpage)
    const perPage =
      Number.isFinite(parsedPerPage) && parsedPerPage > 0
        ? Math.min(Math.trunc(parsedPerPage), 20)
        : 5

    const parsedPage = Number(data?.page)
    const currentPage =
      Number.isFinite(parsedPage) && parsedPage >= 1
        ? Math.trunc(parsedPage)
        : 1
    const offset = (currentPage - 1) * perPage

    const search = data?.search?.trim()
    const whereClause = search
      ? and(
          eq(room.organizationId, organizationId),
          sql`cast(${room.roomNumber} as text) like ${`%${search}%`}`
        )
      : eq(room.organizationId, organizationId)

    const [rooms, [{ total }], [{ totalSearch }]] = await Promise.all([
      await db
        .select({
          id: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          fans: room.fans,
          totalBeds: room.totalBeds,
          attachedBathroom: room.attachedBathroom,
          airConditioner: room.airConditioner,
          lodgingPlanId: room.lodgingPlanId,
          lodgingPlanName: lodgingPlan.name,
          status: room.status,
          createdBy: room.createdBy,
          createdByName: user.name,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        })
        .from(room)
        .leftJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
        .leftJoin(user, eq(room.createdBy, user.id))
        .where(whereClause)
        .orderBy(asc(room.roomNumber))
        .limit(perPage)
        .offset(offset),

      db
        .select({ total: count() })
        .from(room)
        .where(eq(room.organizationId, organizationId)),

      db.select({ totalSearch: count() }).from(room).where(whereClause),
    ])

    const totalPages = Math.ceil(totalSearch / perPage)
    return {
      success: true,
      message: "Rooms fetched successfully",
      data: {
        rooms,
        total,
        totalPages: totalPages,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch rooms",
    }
  }
})

//get specific rooms
type GetSpecificRoomDetailProps = {
  roomId: string
}

const getSpecificRoomDetailSchema = z.object({
  roomId: z.uuid("Invalid room id"),
})

export const getSpecificRoomDetailAction = withAuth<
  GetSpecificRoomDetailProps,
  ActionResponse<RoomItem>
>({
  roles: ["orgUser"],
  permissions: {
    room: ["read"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<RoomItem>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = getSpecificRoomDetailSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid room id",
        fieldErrors,
      }
    }

    const { roomId } = parsed.data

    const [roomData] = await db
      .select({
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        fans: room.fans,
        totalBeds: room.totalBeds,
        attachedBathroom: room.attachedBathroom,
        airConditioner: room.airConditioner,
        lodgingPlanId: room.lodgingPlanId,
        lodgingPlanName: lodgingPlan.name,
        status: room.status,
        createdBy: room.createdBy,
        createdByName: user.name,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      })
      .from(room)
      .leftJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
      .leftJoin(user, eq(room.createdBy, user.id))
      .where(and(eq(room.id, roomId), eq(room.organizationId, organizationId)))

    if (!roomData) {
      return {
        success: false,
        message: "Room not found",
      }
    }

    return {
      success: true,
      message: "Room fetched successfully",
      data: roomData,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch room",
    }
  }
})

export const updateRoomAction = withAuth<
  EditRoomSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    room: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = editRoomSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const {
      roomId,
      roomNumber,
      floor,
      fans,
      totalBeds,
      attachedBathroom,
      airConditioner,
      lodgingPlanId,
      status,
    } = parsed.data

    const [existingRoom] = await db
      .select({ id: room.id })
      .from(room)
      .where(and(eq(room.id, roomId), eq(room.organizationId, organizationId)))

    if (!existingRoom) {
      return {
        success: false,
        message: "Room not found",
      }
    }

    const [validLodgingPlan] = await db
      .select({ id: lodgingPlan.id })
      .from(lodgingPlan)
      .where(
        and(
          eq(lodgingPlan.id, lodgingPlanId),
          eq(lodgingPlan.organizationId, organizationId),
          eq(lodgingPlan.status, "active")
        )
      )

    if (!validLodgingPlan) {
      const [currentPlan] = await db
        .select({ id: lodgingPlan.id })
        .from(room)
        .innerJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
        .where(
          and(
            eq(room.id, roomId),
            eq(lodgingPlan.id, lodgingPlanId),
            eq(lodgingPlan.organizationId, organizationId)
          )
        )

      if (!currentPlan) {
        return {
          success: false,
          message: "Invalid or inactive lodging plan",
          fieldErrors: {
            lodgingPlanId: ["Select a valid active lodging plan"],
          },
        }
      }
    }

    const newTotalBeds = Number(totalBeds)

    const [occupancy] = await db
      .select({
        maxBed: max(studentRoomAssignment.bedNumber),
      })
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.roomId, roomId),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )
    const minBeds = occupancy?.maxBed ?? 0
    if (newTotalBeds < minBeds) {
      return {
        success: false,
        message: `Cannot reduce beds below ${minBeds} while students are assigned`,
        fieldErrors: {
          totalBeds: [`Must be at least ${minBeds}`],
        },
      }
    }

    const [updated] = await db
      .update(room)
      .set({
        roomNumber: Number(roomNumber),
        floor: Number(floor),
        fans: Number(fans),
        totalBeds: newTotalBeds,
        attachedBathroom,
        airConditioner,
        lodgingPlanId,
        status,
        updatedBy: session.user.id,
      })
      .where(and(eq(room.id, roomId), eq(room.organizationId, organizationId)))
      .returning({ id: room.id })

    if (!updated) {
      return {
        success: false,
        message: "Room not found",
      }
    }

    revalidatePath("/org/dashboard/setting/room")
    revalidatePath(`/org/dashboard/setting/room/${roomId}`)

    return {
      success: true,
      message: `Room ${roomNumber} updated successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23505") {
      return {
        success: false,
        message: "A room with this number already exists",
        fieldErrors: {
          roomNumber: ["This room number is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: "Internal server error",
    }
  }
})

//delete room

type DeleteRoomProps = {
  roomId: string
}

const deleteRoomSchema = z.object({
  roomId: z.uuid("Invalid room id"),
})

export const deleteRoomAction = withAuth<DeleteRoomProps, ActionResponse<null>>(
  {
    roles: ["orgUser"],
    permissions: {
      room: ["delete"],
    },
    requireActiveOrg: true,
  }
)(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }
    const parsed = deleteRoomSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { roomId } = parsed.data

    const [existsRoom] = await db
      .select()
      .from(room)
      .where(and(eq(room.id, roomId), eq(room.organizationId, organizationId)))

    if (!existsRoom) {
      return {
        success: false,
        message: "Room not found",
      }
    }

    const [activeAssignment] = await db
      .select()
      .from(studentRoomAssignment)
      .where(
        and(
          eq(studentRoomAssignment.roomId, roomId),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.status, "assigned"),
          isNull(studentRoomAssignment.endDate)
        )
      )

    if (activeAssignment) {
      return {
        success: false,
        message:
          "Cannot delete this room while students are assigned. Release or reassign them first.",
      }
    }

    await db
      .delete(room)
      .where(and(eq(room.id, roomId), eq(room.organizationId, organizationId)))
    revalidatePath("/org/dashboard/setting/room")
    revalidatePath(`/org/dashboard/setting/room/${roomId}`)

    return {
      success: true,
      message: "Room deleted successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined
    if (code === "23505") {
      return {
        success: false,
        message:
          "Room has a past assignment history of students. Marked it as inactive instead.",
      }
    }
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
