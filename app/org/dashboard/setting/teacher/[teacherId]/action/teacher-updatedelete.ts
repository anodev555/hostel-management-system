"use server"

import { and, desc, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import z from "zod"

import db from "@/db"
import { studentTuitionAssignment, user } from "@/db/schema"
import { payrollContract } from "@/db/schema/payroll-schema"
import { tuitionPlan, tuitionTeacher } from "@/db/schema/tuition-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { TeacherDetail } from "@/types/teacher-types"

import {
  deleteTeacherSchema,
  editTeacherSchema,
  type DeleteTeacherSchemaType,
  type EditTeacherSchemaType,
} from "../../schema/teacher-schema"
import { format } from "date-fns"

const TEACHER_LIST_PATH = "/org/dashboard/setting/teacher"

type GetTeacherDetailParams = {
  teacherId: string
}

const getTeacherDetailSchema = z.object({
  teacherId: z.uuid("Invalid teacher id"),
})

export const getTeacherDetailAction = withAuth<
  GetTeacherDetailParams,
  ActionResponse<TeacherDetail>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<TeacherDetail>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization id found" }
    }

    const parsed = getTeacherDetailSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: "Invalid teacher id" }
    }

    const { teacherId } = parsed.data

    const [teacher] = await db
      .select({
        id: tuitionTeacher.id,
        fullName: tuitionTeacher.fullName,
        phone: tuitionTeacher.phone,
        email: tuitionTeacher.email,
        subject: tuitionTeacher.subject,

        address: tuitionTeacher.address,
        status: tuitionTeacher.status,
        createdAt: tuitionTeacher.createdAt,
        updatedAt: tuitionTeacher.updatedAt,
        createdByName: user.name,
        monthlySalary: payrollContract.monthlyAmount,
      })
      .from(tuitionTeacher)
      .leftJoin(user, eq(tuitionTeacher.createdBy, user.id))
      .leftJoin(
        payrollContract,
        eq(payrollContract.teacherId, tuitionTeacher.id)
      )
      .where(
        and(
          eq(tuitionTeacher.id, teacherId),
          eq(tuitionTeacher.organizationId, organizationId)
        )
      )

    if (!teacher) {
      return { success: false, message: "Teacher not found" }
    }

    const plans = await db
      .select({
        planId: tuitionPlan.id,
        planName: tuitionPlan.name,
        planStatus: tuitionPlan.status,
        payeeType: payrollContract.payeeType,
        monthlyAmount: payrollContract.monthlyAmount,
        contractStatus: payrollContract.status,
        effectiveFrom: payrollContract.effectiveFrom,
      })
      .from(tuitionPlan)
      .leftJoin(
        payrollContract,
        and(
          eq(payrollContract.teacherId, teacherId),
          eq(payrollContract.organizationId, organizationId),
          eq(payrollContract.status, "active"),
          isNull(payrollContract.effectiveTo)
        )
      )
      .where(
        and(
          eq(tuitionPlan.teacherId, teacherId),
          eq(tuitionPlan.organizationId, organizationId)
        )
      )
      .orderBy(desc(tuitionPlan.createdAt))

    return {
      success: true,
      data: {
        ...teacher,
        plans: plans.map((plan) => ({
          planId: plan.planId,
          planName: plan.planName,
          planStatus: plan.planStatus,
          payeeType: plan.payeeType ?? "teacher",
          monthlyAmount: plan.monthlyAmount ?? null,
          contractStatus: plan.contractStatus ?? "inactive",
          effectiveFrom: plan.effectiveFrom ?? "",
        })),
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch teacher" }
  }
})

export const updateTeacherAction = withAuth<
  EditTeacherSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization id found" }
    }

    const parsed = editTeacherSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return { success: false, message: "Invalid data", fieldErrors }
    }

    const {
      teacherId,
      fullName,
      phone,
      email,
      subject,
      address,
      status,
      monthlySalary,
    } = parsed.data

    const [existingTeacher] = await db
      .select({ id: tuitionTeacher.id })
      .from(tuitionTeacher)
      .where(
        and(
          eq(tuitionTeacher.id, teacherId),
          eq(tuitionTeacher.organizationId, organizationId)
        )
      )
      .limit(1)
    if (!existingTeacher) {
      return { success: false, message: "Teacher not found" }
    }

    const [existingContract] = await db
      .select({
        id: payrollContract.id,
        monthlyAmount: payrollContract.monthlyAmount,
      })
      .from(payrollContract)
      .where(
        and(
          eq(payrollContract.teacherId, teacherId),
          eq(payrollContract.organizationId, organizationId),
          eq(payrollContract.payeeType, "teacher"),
          eq(payrollContract.status, "active"),
          isNull(payrollContract.effectiveTo)
        )
      )
      .limit(1)

    const salaryChanged =
      !existingContract ||
      Number(monthlySalary) !== Number(existingContract.monthlyAmount)

    const effectiveFrom = format(new Date(), "yyyy-MM-dd")

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tuitionTeacher)
        .set({
          fullName,
          phone,
          email: email || null,
          subject: subject || null,
          address: address || null,
          status,
          updatedBy: session.user.id,
        })
        .where(
          and(
            eq(tuitionTeacher.id, teacherId),
            eq(tuitionTeacher.organizationId, organizationId)
          )
        )
        .returning({ id: tuitionTeacher.id })
      if (!updated) {
        throw new Error("Teacher not found")
      }
      if (!salaryChanged) return

      if (existingContract) {
        await tx
          .update(payrollContract)
          .set({
            status: "inactive",
            effectiveTo: effectiveFrom,
            updatedBy: session.user.id,
          })
          .where(eq(payrollContract.id, existingContract.id))
      }
      await tx.insert(payrollContract).values({
        organizationId,
        payeeType: "teacher",
        teacherId,
        monthlyAmount: monthlySalary,
        effectiveFrom,
        effectiveTo: null,
        status: "active",
        createdBy: session.user.id,
      })
    })

    revalidatePath(TEACHER_LIST_PATH)
    revalidatePath(`${TEACHER_LIST_PATH}/${teacherId}`)

    return {
      success: true,
      message: `Teacher "${fullName}" updated successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to update teacher" }
  }
})

export const deleteTeacherAction = withAuth<
  DeleteTeacherSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["delete"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization id found" }
    }

    const parsed = deleteTeacherSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: "Invalid teacher id" }
    }

    const { teacherId } = parsed.data

    const [existing] = await db
      .select({ id: tuitionTeacher.id, fullName: tuitionTeacher.fullName })
      .from(tuitionTeacher)
      .where(
        and(
          eq(tuitionTeacher.id, teacherId),
          eq(tuitionTeacher.organizationId, organizationId)
        )
      )

    if (!existing) {
      return { success: false, message: "Teacher not found" }
    }

    const [linkedPlan] = await db
      .select({ id: tuitionPlan.id })
      .from(tuitionPlan)
      .where(
        and(
          eq(tuitionPlan.teacherId, teacherId),
          eq(tuitionPlan.organizationId, organizationId)
        )
      )
      .limit(1)

    if (linkedPlan) {
      return {
        success: false,
        message:
          "Cannot delete this teacher because they are linked to tuition plans. Remove or reassign those plans first.",
      }
    }

    const [activeAssignment] = await db
      .select({ id: studentTuitionAssignment.id })
      .from(studentTuitionAssignment)
      .innerJoin(
        tuitionPlan,
        eq(studentTuitionAssignment.tuitionPlanId, tuitionPlan.id)
      )
      .where(
        and(
          eq(tuitionPlan.teacherId, teacherId),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "assigned"),
          isNull(studentTuitionAssignment.endDate)
        )
      )
      .limit(1)

    if (activeAssignment) {
      return {
        success: false,
        message:
          "Cannot delete this teacher while students are assigned to their plans.",
      }
    }

    await db
      .delete(tuitionTeacher)
      .where(
        and(
          eq(tuitionTeacher.id, teacherId),
          eq(tuitionTeacher.organizationId, organizationId)
        )
      )

    revalidatePath(TEACHER_LIST_PATH)

    return {
      success: true,
      message: `Teacher "${existing.fullName}" deleted successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to delete teacher" }
  }
})
