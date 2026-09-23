"use server"

import db from "@/db"
import {
  foodplan,
  lodgingPlan,
  room,
  student,
  studentFoodAssignment,
  studentRoomAssignment,
  studentTuitionAssignment,
  tuitionPlan,
  tuitionTeacher,
  user,
} from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import {
  StudentFoodHistoryItem,
  StudentOverviewItem,
  StudentRoomHistoryItem,
} from "@/types/student-type"
import { StudentTuitionHistoryItem } from "@/types/tuition-types"
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
type StudentOverviewProps = {
  studentId: string
}
export const studentOverviewAction = withAuth<
  StudentOverviewProps,
  ActionResponse<StudentOverviewItem>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<StudentOverviewItem>> => {
  try {
    //check organization
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const { studentId } = data

    //check student
    const [studentRow] = await db
      .select({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        studentPhone: student.studentPhone,
        collegeOrSchool: student.collegeOrSchool,
        course: student.course,
        profileImage: student.profileImage,
        province: student.province,
        district: student.district,
        city: student.city,
        municipality: student.municipality,
        ward: student.ward,
        dateOfBirth: student.dateOfBirth,
        addmissionDate: student.addmissionDate,
        addmissionNumber: student.addmissionNumber,
        gender: student.gender,
        status: student.status,
        fatherName: student.fatherName,
        motherName: student.motherName,
        guardianPhone1: student.guardianPhone1,
        guardianPhone2: student.guardianPhone2,
      })
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
    //get room , fooding tuition  and lodging rows

    const [roomRow, foodRow, tuitionRow] = await Promise.all([
      db
        .select({
          roomNumber: room.roomNumber,
          floor: room.floor,
          lodgingPlanName: lodgingPlan.name,
          bedNumber: studentRoomAssignment.bedNumber,
          monthlyFee: lodgingPlan.monthlyPrice,
          startDate: studentRoomAssignment.startDate,
          endDate: studentRoomAssignment.endDate,
        })
        .from(studentRoomAssignment)
        .leftJoin(room, eq(studentRoomAssignment.roomId, room.id))
        .innerJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
        .where(
          and(
            eq(studentRoomAssignment.studentId, studentRow.id),
            eq(studentRoomAssignment.organizationId, organizationId),
            eq(studentRoomAssignment.status, "assigned"),
            isNull(studentRoomAssignment.endDate)
          )
        )
        .limit(1),

      db
        .select({
          planName: foodplan.name,
          monthlyFee: foodplan.monthlyPrice,
          startDate: studentFoodAssignment.startDate,
          endDate: studentFoodAssignment.endDate,
        })
        .from(studentFoodAssignment)
        .innerJoin(foodplan, eq(studentFoodAssignment.foodPlanId, foodplan.id))
        .where(
          and(
            eq(studentFoodAssignment.studentId, studentRow.id),
            eq(studentFoodAssignment.organizationId, organizationId),
            eq(studentFoodAssignment.status, "assigned"),
            isNull(studentFoodAssignment.endDate)
          )
        )
        .limit(1),

      db
        .select({
          planName: tuitionPlan.name,
          teacherName: tuitionTeacher.fullName,
          monthlyFee: tuitionPlan.monthlyPrice,
          teacherSubject: tuitionTeacher.subject,
          startDate: studentTuitionAssignment.startDate,
          endDate: studentTuitionAssignment.endDate,
        })
        .from(studentTuitionAssignment)
        .innerJoin(
          tuitionPlan,
          eq(studentTuitionAssignment.tuitionPlanId, tuitionPlan.id)
        )
        .leftJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
        .where(
          and(
            eq(studentTuitionAssignment.studentId, studentRow.id),
            eq(studentTuitionAssignment.organizationId, organizationId),
            eq(studentTuitionAssignment.status, "assigned"),
            isNull(studentTuitionAssignment.endDate)
          )
        )
        .limit(1),
    ])

    return {
      success: true,
      data: {
        student: studentRow,
        room: roomRow[0] ?? null,
        food: foodRow[0] ?? null,
        tuition: tuitionRow[0] ?? null,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Something went wrong"}`,
    }
  }
})

export const getStudentRoomHistory = withAuth<
  StudentOverviewProps,
  ActionResponse<StudentRoomHistoryItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<StudentRoomHistoryItem[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }
    const studentId = data.studentId

    //check student
    const [studentRow] = await db
      .select({
        id: student.id,
      })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow) {
      return { success: false, message: "Student not found" }
    }

    const rows = await db
      .select({
        id: studentRoomAssignment.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        bedNumber: studentRoomAssignment.bedNumber,
        lodgingPlanName: lodgingPlan.name,
        lodgingAmount: studentRoomAssignment.lodgingAmount,
        startDate: studentRoomAssignment.startDate,
        endDate: studentRoomAssignment.endDate,
        releasedAt: studentRoomAssignment.releasedAt,
        releasedBy: user.name,
      })
      .from(studentRoomAssignment)
      .innerJoin(room, eq(studentRoomAssignment.roomId, room.id))
      .leftJoin(lodgingPlan, eq(room.lodgingPlanId, lodgingPlan.id))
      .leftJoin(user, eq(studentRoomAssignment.releasedBy, user.id))
      .where(
        and(
          eq(studentRoomAssignment.studentId, studentId),
          eq(studentRoomAssignment.organizationId, organizationId),
          eq(studentRoomAssignment.status, "released"),
          isNotNull(studentRoomAssignment.endDate)
        )
      )
      .orderBy(desc(studentRoomAssignment.startDate))

    return {
      success: true,
      data: rows,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})

export const getStudentFoodHistory = withAuth<
  StudentOverviewProps,
  ActionResponse<StudentFoodHistoryItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<StudentFoodHistoryItem[]>> => {
  try {
    if (!organizationId)
      return { success: false, message: "Organization not found" }

    const studentId = data.studentId

    //check student
    const [studentRow] = await db
      .select({
        id: student.id,
      })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow) return { success: false, message: "Student not found" }
    const assignedByUser = alias(user, "assigned_by_user")
    const releasedByUser = alias(user, "released_by_user")

    const foodHistory = await db
      .select({
        id: studentFoodAssignment.id,
        foodPlanName: foodplan.name,
        foodAmount: foodplan.monthlyPrice,
        startDate: studentFoodAssignment.startDate,
        endDate: studentFoodAssignment.endDate,
        assignedBy: assignedByUser.name,
        releasedBy: releasedByUser.name,
      })
      .from(studentFoodAssignment)
      .innerJoin(foodplan, eq(studentFoodAssignment.foodPlanId, foodplan.id))
      .leftJoin(
        releasedByUser,
        eq(studentFoodAssignment.releasedBy, releasedByUser.id)
      )
      .leftJoin(
        assignedByUser,
        eq(studentFoodAssignment.assignedBy, assignedByUser.id)
      )
      .where(
        and(
          eq(studentFoodAssignment.studentId, studentId),
          eq(studentFoodAssignment.organizationId, organizationId),
          eq(studentFoodAssignment.status, "released"),
          isNotNull(studentFoodAssignment.endDate)
        )
      )
      .orderBy(desc(studentFoodAssignment.startDate))

    return {
      success: true,
      data: foodHistory,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})

//get student tuition history
export const getStudentTuitionHistory = withAuth<
  StudentOverviewProps,
  ActionResponse<StudentTuitionHistoryItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["update"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<StudentTuitionHistoryItem[]>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" }
    }
    const studentId = data.studentId
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
      return { success: false, message: "Student not found" }
    }
    const assignedByUser = alias(user, "assigned_by_user")
    const releasedByUser = alias(user, "released_by_user")
    const tuitionHistory = await db
      .select({
        id: studentTuitionAssignment.id,
        tuitionPlanName: tuitionPlan.name,
        teacherName: tuitionTeacher.fullName,
        tuitionAmount: studentTuitionAssignment.tuitionAmount,
        startDate: studentTuitionAssignment.startDate,
        endDate: studentTuitionAssignment.endDate,
        assignedBy: assignedByUser.name,
        releasedBy: releasedByUser.name,
      })
      .from(studentTuitionAssignment)
      .innerJoin(
        tuitionPlan,
        eq(studentTuitionAssignment.tuitionPlanId, tuitionPlan.id)
      )
      .leftJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .leftJoin(
        releasedByUser,
        eq(studentTuitionAssignment.releasedBy, releasedByUser.id)
      )
      .leftJoin(
        assignedByUser,
        eq(studentTuitionAssignment.assignedBy, assignedByUser.id)
      )
      .where(
        and(
          eq(studentTuitionAssignment.studentId, studentId),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "released"),
          isNotNull(studentTuitionAssignment.endDate)
        )
      )
      .orderBy(desc(studentTuitionAssignment.startDate))
    return {
      success: true,
      data: tuitionHistory,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
