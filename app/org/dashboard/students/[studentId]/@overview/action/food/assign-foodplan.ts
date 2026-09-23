"use server"

import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"

import db from "@/db"
import { foodplan, student, studentFoodAssignment } from "@/db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import {
  foodPlanSchema,
  FoodPlanSchemaType,
} from "../../schema/student-roomfoodtuition"

export const assignFoodPlanAction = withAuth<
  FoodPlanSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId)
      return { success: false, message: "Organization not found" }

    const parsedData = foodPlanSchema.safeParse(data)
    if (!parsedData.success) {
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: parsedData.error.flatten().fieldErrors,
      }
    }

    const { foodPlanId, studentId } = parsedData.data

    //check if student is on org
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

    //check if student is already assigned to a food plan

    const [activeFoodAssignment] = await db
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

    if (activeFoodAssignment) {
      return {
        success: false,
        message:
          "Student already assigned to a food plan! Please remove the existing assignment first.",
      }
    }
    //check if food plan is on org and active

    const [foodPlanRow] = await db
      .select({ id: foodplan.id, monthlyPrice: foodplan.monthlyPrice })
      .from(foodplan)
      .where(
        and(
          eq(foodplan.id, foodPlanId),
          eq(foodplan.organizationId, organizationId),
          eq(foodplan.status, "active")
        )
      )
      .limit(1)

    if (!foodPlanRow) {
      return {
        success: false,
        message: "Food plan not available",
        fieldErrors: {
          foodPlanId: ["Selected food plan is not available"],
        },
      }
    }

    //insert new food assignment
    await db.insert(studentFoodAssignment).values({
      organizationId: organizationId,
      studentId: studentRow.id,
      foodPlanId: foodPlanRow.id,
      foodAmount: foodPlanRow.monthlyPrice,
      startDate: format(new Date(), "yyyy-MM-dd"),
      status: "assigned",
      assignedBy: session.user.id,
    })

    revalidatePath(`/org/dashboard/students/${studentId}`)
    revalidatePath(`/org/dashboard/students`)

    return {
      success: true,
      message: "Food plan assigned successfully",
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
