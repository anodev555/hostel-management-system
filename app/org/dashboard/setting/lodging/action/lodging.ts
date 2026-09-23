"use server"

import { desc, eq, like, and, inArray, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import z from "zod"

import db from "@/db"
import { user } from "@/db/schema/auth-schema"
import { lodgingPlan, room } from "@/db/schema/room-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { LodgingItem } from "@/types/lodging-types"

import {
  createLodgingSchema,
  deleteLodgingSchema,
  editLodgingSchema,
  type CreateLodgingSchemaType,
  type DeleteLodgingSchemaType,
  type EditLodgingSchemaType,
} from "../schema/lodging-schema"
import { studentRoomAssignment } from "@/db/schema"
import { format, subDays } from "date-fns"
import { log } from "console"

//get lodging data
type GetLodgingProps = {
  search?: string
}

export const getLodgingAction = withAuth<
  GetLodgingProps | null,
  ActionResponse<LodgingItem[]>
>({
  roles: ["orgUser"],
  permissionsAny: [
    {
      lodging: ["read"],
    },
    {
      room: ["create"],
    },
  ],
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<LodgingItem[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const search = data?.search?.trim()

    const lodgingData = await db
      .select({
        id: lodgingPlan.id,
        name: lodgingPlan.name,
        monthlyPrice: lodgingPlan.monthlyPrice,
        status: lodgingPlan.status,
        createdBy: lodgingPlan.createdBy,
        createdByName: user.name,
        createdAt: lodgingPlan.createdAt,
        updatedAt: lodgingPlan.updatedAt,
      })
      .from(lodgingPlan)
      .leftJoin(user, eq(lodgingPlan.createdBy, user.id))
      .where(
        search
          ? and(
              eq(lodgingPlan.organizationId, organizationId),
              like(lodgingPlan.name, `%${search}%`)
            )
          : eq(lodgingPlan.organizationId, organizationId)
      )
      .orderBy(desc(lodgingPlan.createdAt))

    return {
      success: true,
      message: "Lodging plans fetched successfully",
      data: lodgingData,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch lodging plans",
    }
  }
})

//create lodging data
export const createLodgingAction = withAuth<
  CreateLodgingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    lodging: ["create"],
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

    const parsed = createLodgingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { name, monthlyPrice } = parsed.data

    await db.insert(lodgingPlan).values({
      organizationId,
      name,
      monthlyPrice,
      status: "active",
      createdBy: session.user.id,
    })

    revalidatePath("/org/dashboard/setting/lodging")

    return {
      success: true,
      message: `Lodging plan "${name}" created successfully`,
      data: null,
    }
  } catch (error: unknown) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23505") {
      return {
        success: false,
        message: "A lodging plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: "Internal server error",
    }
  }
})

//get specific lodging data
type GetSpecificLodgingProps = {
  lodgingId: string
}

const getSpecificLodgingSchema = z.object({
  lodgingId: z.uuid("Invalid lodging id"),
})

export const getSpecificLodgingAction = withAuth<
  GetSpecificLodgingProps,
  ActionResponse<LodgingItem>
>({
  roles: ["orgUser"],
  permissions: {
    lodging: ["read"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<LodgingItem>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = getSpecificLodgingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid lodging id",
        fieldErrors,
      }
    }

    const { lodgingId } = parsed.data

    const [lodging] = await db
      .select({
        id: lodgingPlan.id,
        name: lodgingPlan.name,
        monthlyPrice: lodgingPlan.monthlyPrice,
        status: lodgingPlan.status,
        createdBy: lodgingPlan.createdBy,
        createdByName: user.name,
        createdAt: lodgingPlan.createdAt,
        updatedAt: lodgingPlan.updatedAt,
      })
      .from(lodgingPlan)
      .leftJoin(user, eq(lodgingPlan.createdBy, user.id))
      .where(
        and(
          eq(lodgingPlan.id, lodgingId),
          eq(lodgingPlan.organizationId, organizationId)
        )
      )

    if (!lodging) {
      return {
        success: false,
        message: "Lodging plan not found",
      }
    }

    return {
      success: true,
      message: "Lodging plan fetched successfully",
      data: lodging,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch lodging plan",
    }
  }
})

export const updateLodgingAction = withAuth<
  EditLodgingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    lodging: ["update"],
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

    const parsed = editLodgingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { lodgingId, name, monthlyPrice, status } = parsed.data

    //check existing lodging plan

    const [existing] = await db
      .select({
        monthlyPrice: lodgingPlan.monthlyPrice,
      })
      .from(lodgingPlan)
      .where(
        and(
          eq(lodgingPlan.id, lodgingId),
          eq(lodgingPlan.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        success: false,
        message: "Lodging plan not found",
      }
    }

    const priceChanged = Number(existing.monthlyPrice) !== Number(monthlyPrice)
    await db.transaction(async (tx) => {
      await tx
        .update(lodgingPlan)
        .set({
          name,
          monthlyPrice,
          status,
          updatedBy: session.user.id,
        })
        .where(
          and(
            eq(lodgingPlan.id, lodgingId),
            eq(lodgingPlan.organizationId, organizationId)
          )
        )
        .returning({ id: lodgingPlan.id })

      if (!priceChanged) return

      //get all rooms usign that this plan
      const roomsOnPlan = await tx
        .select({ id: room.id })
        .from(room)
        .where(
          and(
            eq(room.lodgingPlanId, lodgingId),
            eq(room.organizationId, organizationId)
          )
        )

      const roomIds = roomsOnPlan.map((r) => r.id)
      if (roomIds.length === 0) return

      //update the room assignment prices
      const today = new Date()
      const effectiveDate = format(today, "yyyy-MM-dd")
      const previousDate = format(
        subDays(new Date(effectiveDate), 1),
        "yyyy-MM-dd"
      )

      const activeAssignments = await tx
        .select({
          id: studentRoomAssignment.id,
          startDate: studentRoomAssignment.startDate,
          roomId: studentRoomAssignment.roomId,
          studentId: studentRoomAssignment.studentId,
          bedNumber: studentRoomAssignment.bedNumber,
        })
        .from(studentRoomAssignment)
        .where(
          and(
            inArray(studentRoomAssignment.roomId, roomIds),
            eq(studentRoomAssignment.organizationId, organizationId),
            eq(studentRoomAssignment.status, "assigned"),
            isNull(studentRoomAssignment.endDate)
          )
        )

      //released or updated assignments and create new assignment with new price updated
      for (const assignment of activeAssignments) {
        if (assignment.startDate >= effectiveDate) {
          await tx
            .update(studentRoomAssignment)
            .set({ lodgingAmount: monthlyPrice })
            .where(eq(studentRoomAssignment.id, assignment.id))
          continue
        }
        //1 closed the old billing assignments
        await tx
          .update(studentRoomAssignment)
          .set({
            status: "released",
            endDate: previousDate,
            releasedAt: new Date(),
            releasedBy: session.user.id,
          })
          .where(and(eq(studentRoomAssignment.id, assignment.id)))

        //2 create new assignment with new price
        await tx.insert(studentRoomAssignment).values({
          organizationId: organizationId,
          studentId: assignment.studentId,
          roomId: assignment.roomId,
          bedNumber: assignment.bedNumber,
          lodgingAmount: monthlyPrice,
          startDate: effectiveDate,
          status: "assigned",
          assignedBy: session.user.id,
        })
      }
    })

    revalidatePath("/org/dashboard/setting/lodging")
    revalidatePath(`/org/dashboard/setting/lodging/${lodgingId}`)

    return {
      success: true,
      message: `Lodging plan "${name}" updated successfully`,
      data: null,
    }
  } catch (error: unknown) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23505") {
      return {
        success: false,
        message: "A lodging plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: "Something went wrong",
    }
  }
})

export const deleteLodgingAction = withAuth<
  DeleteLodgingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    lodging: ["delete"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = deleteLodgingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid lodging id",
        fieldErrors,
      }
    }

    const { lodgingId } = parsed.data

    const [existing] = await db
      .select({ id: lodgingPlan.id, name: lodgingPlan.name })
      .from(lodgingPlan)
      .where(
        and(
          eq(lodgingPlan.id, lodgingId),
          eq(lodgingPlan.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        success: false,
        message: "Lodging plan not found",
      }
    }

    const [roomUsingPlan] = await db
      .select({ id: room.id })
      .from(room)
      .where(
        and(
          eq(room.lodgingPlanId, lodgingId),
          eq(room.organizationId, organizationId)
        )
      )
      .limit(1)

    if (roomUsingPlan) {
      return {
        success: false,
        message:
          "Cannot delete this plan because it is assigned to one or more rooms. Reassign or remove those rooms first.",
      }
    }

    await db
      .delete(lodgingPlan)
      .where(
        and(
          eq(lodgingPlan.id, lodgingId),
          eq(lodgingPlan.organizationId, organizationId)
        )
      )

    revalidatePath("/org/dashboard/setting/lodging")

    return {
      success: true,
      message: `Lodging plan "${existing.name}" deleted successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to delete lodging plan",
    }
  }
})
