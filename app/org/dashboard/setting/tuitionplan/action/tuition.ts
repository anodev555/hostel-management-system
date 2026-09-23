"use server"

import { revalidatePath } from "next/cache"
import { and, desc, eq, ilike, isNull } from "drizzle-orm"
import z from "zod"

import db from "@/db"
import { studentTuitionAssignment, user } from "@/db/schema"
import { payrollContract } from "@/db/schema/payroll-schema"
import { tuitionPlan, tuitionTeacher } from "@/db/schema/tuition-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { TuitionPlanDetail, TuitionPlanListItem } from "@/types/tuition-types"

import {
  createTuitionSchema,
  deleteTuitionSchema,
  editTuitionSchema,
  type CreateTuitionSchemaType,
  type DeleteTuitionSchemaType,
  type EditTuitionSchemaType,
} from "../schema/create-tuition"
import { format, subDays } from "date-fns"

const TUITION_LIST_PATH = "/org/dashboard/setting/tuitionplan"

export const createTuitionAction = withAuth<
  CreateTuitionSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["create"],
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

    const parsed = createTuitionSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { name, monthlyPrice, teacherId } = parsed.data

    await db.transaction(async (tx) => {
      const [teacherRow] = await tx
        .select({ id: tuitionTeacher.id })
        .from(tuitionTeacher)
        .where(
          and(
            eq(tuitionTeacher.id, teacherId),
            eq(tuitionTeacher.organizationId, organizationId),
            eq(tuitionTeacher.status, "active")
          )
        )
        .limit(1)

      if (!teacherRow) {
        throw new Error("Selected teacher is not available")
      }

      const [planRow] = await tx
        .insert(tuitionPlan)
        .values({
          organizationId,
          teacherId: teacherRow.id,
          name,
          monthlyPrice,
          status: "active",
          createdBy: session.user.id,
        })
        .returning({ id: tuitionPlan.id })

      if (!planRow) {
        throw new Error("Failed to create tuition plan")
      }
    })

    revalidatePath(TUITION_LIST_PATH)

    return {
      success: true,
      message: `Tuition plan "${name}" created successfully`,
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
        message: "A tuition plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }

    if (
      error instanceof Error &&
      error.message === "Selected teacher is not available"
    ) {
      return {
        success: false,
        message: error.message,
        fieldErrors: {
          teacherId: ["Select an active teacher"],
        },
      }
    }

    return {
      success: false,
      message: "Failed to create tuition plan",
    }
  }
})

interface GetTuitionListActionParams {
  search?: string
}

export const getTuitionListAction = withAuth<
  GetTuitionListActionParams,
  ActionResponse<TuitionPlanListItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<TuitionPlanListItem[]>> => {
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
          eq(tuitionPlan.organizationId, organizationId),
          ilike(tuitionPlan.name, `%${search}%`)
        )
      : eq(tuitionPlan.organizationId, organizationId)

    const tuitionList = await db
      .select({
        id: tuitionPlan.id,
        name: tuitionPlan.name,
        monthlyPrice: tuitionPlan.monthlyPrice,
        status: tuitionPlan.status,
        teacherId: tuitionPlan.teacherId,
        teacherName: tuitionTeacher.fullName,
        teacherPhone: tuitionTeacher.phone,
        teacherSubject: tuitionTeacher.subject,
        createdAt: tuitionPlan.createdAt,
        updatedAt: tuitionPlan.updatedAt,
        createdBy: tuitionPlan.createdBy,
        updatedBy: tuitionPlan.updatedBy,
      })
      .from(tuitionPlan)
      .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .where(whereClause)
      .orderBy(desc(tuitionPlan.createdAt))

    return {
      success: true,
      message: "Tuition plans fetched successfully",
      data: tuitionList,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})

type GetSpecificTuitionProps = {
  tuitionPlanId: string
}

const getSpecificTuitionSchema = z.object({
  tuitionPlanId: z.uuid("Invalid tuition plan id"),
})

export const getSpecificTuitionAction = withAuth<
  GetSpecificTuitionProps,
  ActionResponse<TuitionPlanDetail>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<TuitionPlanDetail>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = getSpecificTuitionSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid tuition plan id",
        fieldErrors,
      }
    }

    const { tuitionPlanId } = parsed.data

    const [plan] = await db
      .select({
        id: tuitionPlan.id,
        name: tuitionPlan.name,
        monthlyPrice: tuitionPlan.monthlyPrice,
        status: tuitionPlan.status,
        teacherId: tuitionPlan.teacherId,
        teacherName: tuitionTeacher.fullName,
        teacherPhone: tuitionTeacher.phone,
        teacherSubject: tuitionTeacher.subject,
        teacherEmail: tuitionTeacher.email,
        teacherAddress: tuitionTeacher.address,
        createdBy: tuitionPlan.createdBy,
        createdByName: user.name,
        createdAt: tuitionPlan.createdAt,
        updatedAt: tuitionPlan.updatedAt,
        updatedBy: tuitionPlan.updatedBy,
      })
      .from(tuitionPlan)
      .innerJoin(tuitionTeacher, eq(tuitionPlan.teacherId, tuitionTeacher.id))
      .leftJoin(user, eq(tuitionPlan.createdBy, user.id))
      .where(
        and(
          eq(tuitionPlan.id, tuitionPlanId),
          eq(tuitionPlan.organizationId, organizationId)
        )
      )

    if (!plan) {
      return {
        success: false,
        message: "Tuition plan not found",
      }
    }

    return {
      success: true,
      message: "Tuition plan fetched successfully",
      data: plan,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch tuition plan",
    }
  }
})

export const updateTuitionAction = withAuth<
  EditTuitionSchemaType,
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
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = editTuitionSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const { tuitionPlanId, teacherId, name, monthlyPrice, status } = parsed.data

    const [existing] = await db
      .select({
        planId: tuitionPlan.id,
        linkedTeacherId: tuitionPlan.teacherId,
        monthlyPrice: tuitionPlan.monthlyPrice,
      })
      .from(tuitionPlan)
      .where(
        and(
          eq(tuitionPlan.id, tuitionPlanId),
          eq(tuitionPlan.organizationId, organizationId)
        )
      )
    if (!existing || existing.linkedTeacherId !== teacherId) {
      return {
        success: false,
        message: "Tuition plan not found",
      }
    }
    console.log("existing", existing)
    const priceChanged = Number(existing.monthlyPrice) !== Number(monthlyPrice)
    console.log("priceChanged", priceChanged)
    await db.transaction(async (tx) => {
      const [updatedPlan] = await tx
        .update(tuitionPlan)
        .set({
          name,
          monthlyPrice,
          status,
          updatedBy: session.user.id,
        })
        .where(
          and(
            eq(tuitionPlan.id, tuitionPlanId),
            eq(tuitionPlan.organizationId, organizationId)
          )
        )
        .returning({ id: tuitionPlan.id })
      if (!updatedPlan) {
        throw new Error("Tuition plan not found")
      }

      if (!priceChanged) return
      const today = new Date()
      const effectiveDate = format(today, "yyyy-MM-dd")
      const previousDate = format(subDays(today, 1), "yyyy-MM-dd")

      const activeAssignments = await tx
        .select({
          id: studentTuitionAssignment.id,
          startDate: studentTuitionAssignment.startDate,
          studentId: studentTuitionAssignment.studentId,
          tuitionPlanId: studentTuitionAssignment.tuitionPlanId,
        })
        .from(studentTuitionAssignment)
        .where(
          and(
            eq(studentTuitionAssignment.tuitionPlanId, tuitionPlanId),
            eq(studentTuitionAssignment.organizationId, organizationId),
            eq(studentTuitionAssignment.status, "assigned"),
            isNull(studentTuitionAssignment.endDate)
          )
        )

      for (const assignment of activeAssignments) {
        if (assignment.startDate >= effectiveDate) {
          await tx
            .update(studentTuitionAssignment)
            .set({ tuitionAmount: monthlyPrice })
            .where(eq(studentTuitionAssignment.id, assignment.id))
          continue
        }

        await tx
          .update(studentTuitionAssignment)
          .set({
            status: "released",
            endDate: previousDate,
            releasedAt: new Date(),
            releasedBy: session.user.id,
          })
          .where(eq(studentTuitionAssignment.id, assignment.id))

        await tx.insert(studentTuitionAssignment).values({
          organizationId,
          studentId: assignment.studentId,
          tuitionPlanId: assignment.tuitionPlanId,
          tuitionAmount: monthlyPrice,
          startDate: effectiveDate,
          status: "assigned",
          assignedBy: session.user.id,
        })
      }
    })
    revalidatePath(TUITION_LIST_PATH)
    revalidatePath(`${TUITION_LIST_PATH}/${tuitionPlanId}`)

    return {
      success: true,
      message: `Tuition plan "${name}" updated successfully`,
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
        message: "A tuition plan with this name already exists",
        fieldErrors: {
          name: ["This name is already used in your organization"],
        },
      }
    }

    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Something went wrong"}`,
    }
  }
})

export const deleteTuitionAction = withAuth<
  DeleteTuitionSchemaType,
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
      return {
        success: false,
        message: "No organization id found",
      }
    }

    const parsed = deleteTuitionSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid tuition plan id",
        fieldErrors,
      }
    }

    const { tuitionPlanId } = parsed.data

    const [existing] = await db
      .select({
        id: tuitionPlan.id,
        name: tuitionPlan.name,
        teacherId: tuitionPlan.teacherId,
      })
      .from(tuitionPlan)
      .where(
        and(
          eq(tuitionPlan.id, tuitionPlanId),
          eq(tuitionPlan.organizationId, organizationId)
        )
      )

    if (!existing) {
      return {
        success: false,
        message: "Tuition plan not found",
      }
    }

    const [assignmentUsingPlan] = await db
      .select({ id: studentTuitionAssignment.id })
      .from(studentTuitionAssignment)
      .where(
        and(
          eq(studentTuitionAssignment.tuitionPlanId, tuitionPlanId),
          eq(studentTuitionAssignment.organizationId, organizationId),
          eq(studentTuitionAssignment.status, "assigned")
        )
      )
      .limit(1)

    if (assignmentUsingPlan) {
      return {
        success: false,
        message:
          "Cannot delete this plan because it is assigned to one or more students. Release those assignments first.",
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(tuitionPlan)
        .where(
          and(
            eq(tuitionPlan.id, tuitionPlanId),
            eq(tuitionPlan.organizationId, organizationId)
          )
        )
    })

    revalidatePath(TUITION_LIST_PATH)

    return {
      success: true,
      message: `Tuition plan "${existing.name}" deleted successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined

    if (code === "23001") {
      return {
        success: false,
        message:
          "Cannot delete this plan because it is linked to student assignment history. Set the plan to inactive instead.",
      }
    }
    return {
      success: false,
      message: "Failed to delete tuition plan",
    }
  }
})
