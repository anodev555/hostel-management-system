"use server"

import db from "@/db"
import {
  student,
  studentTuitionAssignment,
  tuitionPlan,
  tuitionTeacher,
} from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { eq, and, isNull, count, ilike } from "drizzle-orm"
import { parsePage, parsePerPage } from "../../lib/utils"
import { GroupedTuitionPlan } from "@/types/tuition-types"

export const getOrgTuitions = withAuth<
  void,
  ActionResponse<GroupedTuitionPlan[]>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GroupedTuitionPlan[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const tuitionRows = await db
      .select({
        tuitionPlanId: tuitionPlan.id,
        tuitionPlanName: tuitionPlan.name,
        monthlyFee: tuitionPlan.monthlyPrice,
        teacherName: tuitionTeacher.fullName,
        subjects: tuitionTeacher.subject,
        studentId: student.id,
        studentName: student.fullName,
        studentProfileImage: student.profileImage,
        studentPhone: student.studentPhone,
        teacherAddress: tuitionTeacher.address,
        teacherPhone: tuitionTeacher.phone,
        startDate: studentTuitionAssignment.startDate,
      })
      .from(studentTuitionAssignment)
      .innerJoin(student, eq(studentTuitionAssignment.studentId, student.id))
      .innerJoin(
        tuitionPlan,
        eq(studentTuitionAssignment.tuitionPlanId, tuitionPlan.id)
      )
      .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .where(
        and(
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "assigned"),
          isNull(studentTuitionAssignment.endDate)
        )
      )

    //grouping data by tuition plan id

    const planMap = new Map<string, GroupedTuitionPlan>()

    for (const row of tuitionRows) {
      let plan = planMap.get(row.tuitionPlanId)
      if (!plan) {
        plan = {
          tuitionPlanId: row.tuitionPlanId,
          tuitionPlanName: row.tuitionPlanName,
          teacherName: row.teacherName,
          subjects: row.subjects || "",
          monthlyFee: row.monthlyFee,
          teacherPhone: row.teacherPhone || "",
          teacherAddress: row.teacherAddress || "",
          students: [],
        }
        planMap.set(row.tuitionPlanId, plan)
      }
      plan.students.push({
        studentId: row.studentId,
        studentName: row.studentName,
        studentProfileImage: row.studentProfileImage || "",
        studentPhone: row.studentPhone || "",
      })
    }
    const plans = Array.from(planMap.values())
    return {
      success: true,
      data: plans,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
