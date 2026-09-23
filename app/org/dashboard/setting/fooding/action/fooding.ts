"use server"

import { revalidatePath } from "next/cache"
import z from "zod"

import db from "@/db"
import { foodplan } from "@/db/schema/foodplan-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { and, desc, eq, ilike, isNull } from "drizzle-orm"
import { studentFoodAssignment } from "@/db/schema/studentfoodassignment-schema"
import {
  createFoodingSchema,
  deleteFoodingSchema,
  editFoodingSchema,
  type CreateFoodingSchemaType,
  type DeleteFoodingSchemaType,
  type EditFoodingSchemaType,
} from "../schema/create-fooding"
import { FoodPlan } from "@/types/food-types"
import { student, user } from "@/db/schema"
import { format, subDays } from "date-fns"

export const createFoodingAction = withAuth<
  CreateFoodingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    food: ["create"],
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

    const parsed = createFoodingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { name, monthlyPrice } = parsed.data

    await db.insert(foodplan).values({
      organizationId,
      name,
      monthlyPrice,
      status: "active",
      createdBy: session.user.id,
    })

    revalidatePath("/org/dashboard/setting/fooding")

    return {
      success: true,
      message: `Food plan "${name}" created successfully`,
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
        message: "A food plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: "Failed to create food plan",
    }
  }
})

interface GetFoodingListActionParams {
  search?: string
}

export const getFoodingListAction = withAuth<
  GetFoodingListActionParams,
  ActionResponse<FoodPlan[]>
>({
  roles: ["orgUser"],
  permissions: {
    food: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
}): Promise<ActionResponse<FoodPlan[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }
    const { search } = data ?? {}

    const whereClause = search
      ? and(
          ilike(foodplan.name, `%${search}%`),
          eq(foodplan.organizationId, organizationId)
        )
      : eq(foodplan.organizationId, organizationId)

    const foodingList = await db
      .select({
        id: foodplan.id,
        name: foodplan.name,
        monthlyPrice: foodplan.monthlyPrice,
        status: foodplan.status,
        createdAt: foodplan.createdAt,
        updatedAt: foodplan.updatedAt,
        createdBy: foodplan.createdBy,
        updatedBy: foodplan.updatedBy,
      })
      .from(foodplan)
      .leftJoin(user, eq(foodplan.createdBy, user.id))
      .where(whereClause)
      .orderBy(desc(foodplan.createdAt))

    return {
      success: true,
      message: "Fooding list fetched successfully",
      data: foodingList,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})

type GetSpecificFoodingProps = {
  foodPlanId: string
}

const getSpecificFoodingSchema = z.object({
  foodPlanId: z.uuid("Invalid food plan id"),
})

export const getSpecificFoodingAction = withAuth<
  GetSpecificFoodingProps,
  ActionResponse<FoodPlan>
>({
  roles: ["orgUser"],
  permissions: {
    food: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<FoodPlan>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = getSpecificFoodingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid food plan id",
        fieldErrors,
      }
    }

    const { foodPlanId } = parsed.data

    const [foodPlan] = await db
      .select({
        id: foodplan.id,
        name: foodplan.name,
        monthlyPrice: foodplan.monthlyPrice,
        status: foodplan.status,
        createdBy: foodplan.createdBy,
        createdByName: user.name,
        createdAt: foodplan.createdAt,
        updatedAt: foodplan.updatedAt,
        updatedBy: foodplan.updatedBy,
      })
      .from(foodplan)
      .leftJoin(user, eq(foodplan.createdBy, user.id))
      .where(
        and(
          eq(foodplan.id, foodPlanId),
          eq(foodplan.organizationId, organizationId)
        )
      )

    if (!foodPlan) {
      return {
        success: false,
        message: "Food plan not found",
      }
    }

    return {
      success: true,
      message: "Food plan fetched successfully",
      data: foodPlan,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch food plan",
    }
  }
})

export const updateFoodingAction = withAuth<
  EditFoodingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    food: ["update"],
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

    const parsed = editFoodingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { foodPlanId, name, monthlyPrice, status } = parsed.data

    //check existing food plan
    const [existingFoodPlan] = await db
      .select({
        monthlyPrice: foodplan.monthlyPrice,
      })
      .from(foodplan)
      .where(
        and(
          eq(foodplan.id, foodPlanId),
          eq(foodplan.organizationId, organizationId)
        )
      )
    if (!existingFoodPlan) {
      return {
        success: false,
        message: "Food plan not found",
      }
    }

    const priceChanged =
      Number(existingFoodPlan.monthlyPrice) !== Number(monthlyPrice)

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(foodplan)
        .set({
          name,
          monthlyPrice,
          status,
          updatedBy: session.user.id,
        })
        .where(
          and(
            eq(foodplan.id, foodPlanId),
            eq(foodplan.organizationId, organizationId)
          )
        )
        .returning({ id: foodplan.id })

      if (!updated) {
        throw new Error("Failed to update food plan")
      }

      if (!priceChanged) return

      const today = new Date()
      const effectiveDate = format(today, "yyyy-MM-dd")
      const previousDate = format(subDays(today, 1), "yyyy-MM-dd")

      const activeAssignments = await tx
        .select({
          id: studentFoodAssignment.id,
          startDate: studentFoodAssignment.startDate,
          studentId: studentFoodAssignment.studentId,
          foodPlanId: studentFoodAssignment.foodPlanId,
        })
        .from(studentFoodAssignment)
        .where(
          and(
            eq(studentFoodAssignment.foodPlanId, foodPlanId),
            eq(studentFoodAssignment.organizationId, organizationId),
            eq(studentFoodAssignment.status, "assigned"),
            isNull(studentFoodAssignment.endDate)
          )
        )

      for (const assignment of activeAssignments) {
        if (assignment.startDate >= effectiveDate) {
          await tx
            .update(studentFoodAssignment)
            .set({ foodAmount: monthlyPrice })
            .where(eq(studentFoodAssignment.id, assignment.id))
          continue
        }
        await tx
          .update(studentFoodAssignment)
          .set({
            status: "released",
            endDate: previousDate,
            releasedAt: new Date(),
            releasedBy: session.user.id,
          })
          .where(eq(studentFoodAssignment.id, assignment.id))
        await tx.insert(studentFoodAssignment).values({
          organizationId,
          studentId: assignment.studentId,
          foodPlanId: assignment.foodPlanId,
          foodAmount: monthlyPrice,
          startDate: effectiveDate,
          status: "assigned",
          assignedBy: session.user.id,
        })
      }
    })

    revalidatePath("/org/dashboard/setting/fooding")
    revalidatePath(`/org/dashboard/setting/fooding/${foodPlanId}`)

    return {
      success: true,
      message: `Food plan "${name}" updated successfully`,
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
        message: "A food plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }
    if (
      error instanceof Error &&
      error.message === "Failed to update food plan"
    ) {
      return {
        success: false,
        message: "Failed to update food plan",
      }
    }

    return {
      success: false,
      message: "Internal server error",
    }
  }
})

export const deleteFoodingAction = withAuth<
  DeleteFoodingSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    food: ["delete"],
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

    const parsed = deleteFoodingSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid food plan id",
        fieldErrors,
      }
    }

    const { foodPlanId } = parsed.data

    const [existing] = await db
      .select({ id: foodplan.id, name: foodplan.name })
      .from(foodplan)
      .where(
        and(
          eq(foodplan.id, foodPlanId),
          eq(foodplan.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        success: false,
        message: "Food plan not found",
      }
    }

    const [assignmentUsingPlan] = await db
      .select({ id: studentFoodAssignment.id })
      .from(studentFoodAssignment)
      .where(
        and(
          eq(studentFoodAssignment.foodPlanId, foodPlanId),
          eq(studentFoodAssignment.organizationId, organizationId),
          eq(studentFoodAssignment.status, "assigned")
        )
      )
      .limit(1)

    if (assignmentUsingPlan) {
      return {
        success: false,
        message:
          "Cannot delete this plan because it is assigned to one or more students. Reassign or release those assignments first.",
      }
    }

    await db
      .delete(foodplan)
      .where(
        and(
          eq(foodplan.id, foodPlanId),
          eq(foodplan.organizationId, organizationId)
        )
      )

    revalidatePath("/org/dashboard/setting/fooding")

    return {
      success: true,
      message: `Food plan "${existing.name}" deleted successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to delete food plan",
    }
  }
})
