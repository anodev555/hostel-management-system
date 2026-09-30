"use server"
import { z } from "zod"
import { format } from "date-fns"
import { and, count, desc, eq, gte, isNull, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import db from "@/db"
import { student, visitors } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import {
  GetAllVisitorsResponse,
  VisitorStudentOption,
} from "@/types/visitor-type"
import { parsePage, parsePerPage } from "../../lib/utils"
import {
  checkinVisitorSchema,
  CheckinVisitorSchemaType,
  checkoutVisitorSchema,
  CheckoutVisitorSchemaType,
  deleteVisitorSchema,
  DeleteVisitorSchemaType,
  visitorFilterSchema,
  VisitorFilterProps,
} from "../schema/visitorSchema"

const VISITORS_PATH = "/org/dashboard/visitors"

export const checkinVisitorAction = withAuth<
  CheckinVisitorSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    visitor: ["create"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }) => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found! Please login again" }
    }

    const parsed = checkinVisitorSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    // Verify the student belongs to this organization and snapshot the name.
    const studentRow = await db
      .select({ id: student.id, fullName: student.fullName })
      .from(student)
      .where(
        and(
          eq(student.id, parsed.data.studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow[0]) {
      return {
        success: false,
        message: "Selected student not found in this hostel",
      }
    }

    const checkinAt = new Date()
    await db.insert(visitors).values({
      organizationId,
      visitorName: parsed.data.visitorName,
      relation: parsed.data.relation,
      age: parsed.data.age ?? null,
      expectedVisitDuration: parsed.data.expectedVisitDuration || null,
      studentId: studentRow[0].id,
      studentName: studentRow[0].fullName,
      reason: parsed.data.reason,
      checkinAt,
      visitDate: format(checkinAt, "yyyy-MM-dd"),
      visitYear: checkinAt.getFullYear(),
      visitMonth: checkinAt.getMonth() + 1,
      visitDayOfMonth: checkinAt.getDate(),
      createdBy: session?.user?.id ?? null,
    })

    revalidatePath(VISITORS_PATH)
    return { success: true, message: "Visitor checked in successfully", data: null }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to check in visitor"}`,
    }
  }
})

const parseOptionalDate = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? undefined : format(date, "yyyy-MM-dd")
}

export const getAllVisitorsAction = withAuth<
  VisitorFilterProps,
  ActionResponse<GetAllVisitorsResponse>
>({
  roles: ["orgUser"],
  permissions: {
    visitor: ["read"],
  },
  requireActiveOrg: true,
})(async ({ organizationId, data }): Promise<ActionResponse<GetAllVisitorsResponse>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please login again",
      }
    }

    const parsedData = visitorFilterSchema.safeParse(data || {})
    if (!parsedData.success) {
      const { fieldErrors } = parsedData.error.flatten()
      return {
        success: false,
        message: "Invalid filter parameters",
        fieldErrors,
      }
    }

    const { from, to, perpage, page } = parsedData.data
    const perPage = parsePerPage(perpage)
    const pageNumber = parsePage(page)
    const offset = (pageNumber - 1) * perPage

    const fromDate = parseOptionalDate(from)
    const toDate = parseOptionalDate(to)

    const filterCondition = [eq(visitors.organizationId, organizationId)]
    if (fromDate) filterCondition.push(gte(visitors.visitDate, fromDate))
    if (toDate) filterCondition.push(lte(visitors.visitDate, toDate))
    const whereClause = and(...filterCondition)

    const [rows, [{ total }], [{ insideCount }]] = await Promise.all([
      db
        .select({
          id: visitors.id,
          visitorName: visitors.visitorName,
          relation: visitors.relation,
          age: visitors.age,
          expectedVisitDuration: visitors.expectedVisitDuration,
          studentId: visitors.studentId,
          studentName: visitors.studentName,
          reason: visitors.reason,
          checkinAt: visitors.checkinAt,
          checkoutAt: visitors.checkoutAt,
          visitDate: visitors.visitDate,
          createdBy: visitors.createdBy,
          checkoutBy: visitors.checkoutBy,
        })
        .from(visitors)
        .where(whereClause)
        .orderBy(desc(visitors.checkinAt))
        .limit(perPage)
        .offset(offset),
      db
        .select({ total: count(visitors.id) })
        .from(visitors)
        .where(whereClause),
      db
        .select({ insideCount: count(visitors.id) })
        .from(visitors)
        .where(
          and(eq(visitors.organizationId, organizationId), isNull(visitors.checkoutAt))
        ),
    ])

    return {
      success: true,
      message: "Visitors retrieved successfully",
      data: {
        visitors: rows,
        totalPages: Math.ceil(total / perPage),
        total,
        insideCount,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong" }
  }
})

export const checkoutVisitorAction = withAuth<
  CheckoutVisitorSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    visitor: ["checkout"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }) => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found! Please login again" }
    }

    const parsed = checkoutVisitorSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: "Invalid visitor id" }
    }

    const existing = await db
      .select({ id: visitors.id, checkoutAt: visitors.checkoutAt })
      .from(visitors)
      .where(
        and(eq(visitors.id, parsed.data.id), eq(visitors.organizationId, organizationId))
      )
      .limit(1)

    if (!existing[0]) {
      return { success: false, message: "Visitor record not found" }
    }

    if (existing[0].checkoutAt) {
      return { success: false, message: "Visitor is already checked out" }
    }

    await db
      .update(visitors)
      .set({
        checkoutAt: new Date(),
        checkoutBy: session?.user?.id ?? null,
      })
      .where(eq(visitors.id, parsed.data.id))

    revalidatePath(VISITORS_PATH)
    return { success: true, message: "Visitor checked out successfully", data: null }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to check out visitor"}`,
    }
  }
})

export const deleteVisitorAction = withAuth<
  DeleteVisitorSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    visitor: ["delete"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }) => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found! Please login again" }
    }

    const parsed = deleteVisitorSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: "Invalid visitor id" }
    }

    const deleted = await db
      .delete(visitors)
      .where(
        and(eq(visitors.id, parsed.data.id), eq(visitors.organizationId, organizationId))
      )
      .returning({ id: visitors.id })

    if (deleted.length === 0) {
      return { success: false, message: "Visitor record not found" }
    }

    revalidatePath(VISITORS_PATH)
    return { success: true, message: "Visitor record deleted successfully", data: null }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to delete visitor"}`,
    }
  }
})

export const getVisitorStudentsAction = withAuth<
  Record<string, never>,
  ActionResponse<VisitorStudentOption[]>
>({
  roles: ["orgUser"],
  permissions: {
    visitor: ["create"],
  },
  requireActiveOrg: true,
})(async ({ organizationId }) => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found! Please login again" }
    }

    const rows = await db
      .select({ id: student.id, fullName: student.fullName })
      .from(student)
      .where(
        and(eq(student.organizationId, organizationId), eq(student.status, "active"))
      )
      .orderBy(student.fullName)
      .limit(500)

    return { success: true, message: "Students retrieved", data: rows }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to load students" }
  }
})
