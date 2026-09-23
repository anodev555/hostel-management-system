"use server"

import { and, asc, eq } from "drizzle-orm"

import db from "@/db"
import { tuitionPlan, tuitionTeacher } from "@/db/schema/tuition-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { ActiveTuitionPlanOption } from "@/types/tuition-types"

export const getActiveTuitionPlansAction = withAuth<
  void,
  ActionResponse<ActiveTuitionPlanOption[]>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["create"],
  },
  requireActiveOrg: true,
})(async ({
  organizationId,
}): Promise<ActionResponse<ActiveTuitionPlanOption[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const activeTuitionPlans = await db
      .select({
        id: tuitionPlan.id,
        name: tuitionPlan.name,
        monthlyPrice: tuitionPlan.monthlyPrice,
        teacherName: tuitionTeacher.fullName,
        teacherSubject: tuitionTeacher.subject,
      })
      .from(tuitionPlan)
      .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .where(
        and(
          eq(tuitionPlan.organizationId, organizationId),
          eq(tuitionPlan.status, "active")
        )
      )
      .orderBy(asc(tuitionPlan.name))

    return {
      success: true,
      message: "Active tuition plans fetched successfully",
      data: activeTuitionPlans,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch active tuition plans",
    }
  }
})
