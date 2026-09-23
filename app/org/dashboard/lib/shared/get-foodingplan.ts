"use server"

import { and, asc, eq } from "drizzle-orm"

import db from "@/db"
import { foodplan } from "@/db/schema/foodplan-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { ActiveFoodPlanOption } from "@/types/food-types"
import { student } from "@/db/schema"

export const getActiveFoodPlansAction = withAuth<
  void,
  ActionResponse<ActiveFoodPlanOption[]>
>({
  roles: ["orgUser"],
  permissionsAny: [{ student: ["create"] }, { student: ["update"] }],
  requireActiveOrg: true,
})(async ({
  organizationId,
}): Promise<ActionResponse<ActiveFoodPlanOption[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const activeFoodPlans = await db
      .select({
        id: foodplan.id,
        name: foodplan.name,
        monthlyPrice: foodplan.monthlyPrice,
      })
      .from(foodplan)
      .where(
        and(
          eq(foodplan.organizationId, organizationId),
          eq(foodplan.status, "active")
        )
      )
      .orderBy(asc(foodplan.name))

    return {
      success: true,
      message: "Active food plans fetched successfully",
      data: activeFoodPlans,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch active food plans",
    }
  }
})
