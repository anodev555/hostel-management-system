"use server"

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import z from "zod"

import db from "@/db"
import { tuitionPlan, tuitionTeacher } from "@/db/schema/tuition-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import {
  ActiveTeacherOption,
  GetTeachersResponse,
  TeacherListItem,
} from "@/types/teacher-types"

import { parsePage, parsePerPage } from "../../../lib/utils"
import {
  createTeacherSchema,
  type CreateTeacherSchemaType,
} from "../schema/teacher-schema"
import { payrollContract } from "@/db/schema"
import { format } from "date-fns"

const TEACHER_LIST_PATH = "/org/dashboard/setting/teacher"

type GetTeachersParams = {
  search?: string
  page?: string
  perpage?: string
}

export const getTeachersAction = withAuth<
  GetTeachersParams,
  ActionResponse<GetTeachersResponse>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetTeachersResponse>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization id found" }
    }

    const search = data?.search?.trim()
    let page = parsePage(data?.page)
    const perPage = parsePerPage(data?.perpage)

    const whereClause = and(
      eq(tuitionTeacher.organizationId, organizationId),
      search ? ilike(tuitionTeacher.fullName, `%${search}%`) : undefined
    )

    const [[{ total }], rows] = await Promise.all([
      db.select({ total: count() }).from(tuitionTeacher).where(whereClause),
      db
        .select({
          id: tuitionTeacher.id,
          fullName: tuitionTeacher.fullName,
          phone: tuitionTeacher.phone,
          email: tuitionTeacher.email,
          subject: tuitionTeacher.subject,
          status: tuitionTeacher.status,
          createdAt: tuitionTeacher.createdAt,
          planCount: sql<number>`cast(count(${tuitionPlan.id}) as integer)`,
        })
        .from(tuitionTeacher)

        .leftJoin(
          tuitionPlan,
          and(
            eq(tuitionPlan.teacherId, tuitionTeacher.id),
            eq(tuitionPlan.organizationId, organizationId)
          )
        )
        .where(whereClause)
        .groupBy(tuitionTeacher.id)
        .orderBy(desc(tuitionTeacher.createdAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
    ])

    const totalPages = total === 0 ? 0 : Math.ceil(total / perPage)
    if (totalPages > 0) {
      page = Math.min(page, totalPages)
    }

    const teachers: TeacherListItem[] = rows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      subject: row.subject,
      status: row.status,
      planCount: row.planCount,
      createdAt: row.createdAt,
    }))

    return {
      success: true,
      message: "Teachers fetched successfully",
      data: { teachers, total, totalPages },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch teachers" }
  }
})

export const getActiveTeachersAction = withAuth<
  void,
  ActionResponse<ActiveTeacherOption[]>
>({
  roles: ["orgUser"],
  permissions: {
    tuition: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  organizationId,
}): Promise<ActionResponse<ActiveTeacherOption[]>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No organization id found" }
    }

    const teachers = await db
      .select({
        id: tuitionTeacher.id,
        fullName: tuitionTeacher.fullName,
        subject: tuitionTeacher.subject,
        phone: tuitionTeacher.phone,
      })
      .from(tuitionTeacher)
      .where(
        and(
          eq(tuitionTeacher.organizationId, organizationId),
          eq(tuitionTeacher.status, "active")
        )
      )
      .orderBy(tuitionTeacher.fullName)

    return {
      success: true,
      data: teachers,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch active teachers" }
  }
})

export const createTeacherAction = withAuth<
  CreateTeacherSchemaType,
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
      return { success: false, message: "No organization id found" }
    }

    const parsed = createTeacherSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return { success: false, message: "Invalid data", fieldErrors }
    }

    const { fullName, phone, email, subject, address, status } = parsed.data

    await db.transaction(async (tx) => {
      const [teacher] = await tx
        .insert(tuitionTeacher)
        .values({
          organizationId,
          fullName,
          phone,
          email: email || null,
          subject: subject || null,
          address: address || null,
          status,
          createdBy: session.user.id,
        })
        .returning({
          id: tuitionTeacher.id,
        })

      await tx.insert(payrollContract).values({
        organizationId: organizationId,
        payeeType: "teacher",
        teacherId: teacher.id,
        monthlyAmount: parsed.data.monthlySalary,
        effectiveFrom: format(new Date(), "yyyy-MM-dd"),
        effectiveTo: null,
        status: "active",
        createdBy: session.user.id,
      })
    })

    revalidatePath(TEACHER_LIST_PATH)

    return {
      success: true,
      message: `Teacher "${fullName}" created successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to create teacher" }
  }
})
