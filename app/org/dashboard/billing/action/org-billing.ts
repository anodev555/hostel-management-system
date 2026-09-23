"use server"

import db from "@/db"
import { invoice } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import {
  GetOrgBillingResponse,
  OrgBillingOpenInvoice,
  OrgBillingStudentRow,
} from "@/types/billing-type"
import { format } from "date-fns"
import { and, asc, eq, inArray } from "drizzle-orm"
import z from "zod"

import { money } from "../../lib/utils"

const DEFAULT_PER_PAGE = 5
const MAX_PER_PAGE = 20

const getOrgBillingSchema = z.object({
  search: z.string().trim().optional(),
  page: z.string().optional(),
  perpage: z.string().optional(),
})

function parsePage(value: string | undefined) {
  const page = Math.trunc(Number(value))
  if (!Number.isFinite(page) || page < 1) return 1
  return page
}

function parsePerPage(value: string | undefined) {
  const perPage = Math.trunc(Number(value))
  if (!Number.isFinite(perPage) || perPage < 1) return DEFAULT_PER_PAGE
  return Math.min(perPage, MAX_PER_PAGE)
}

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0)
}

/** Keep dates as YYYY-MM-DD so the UI never shifts a day (timezone). */
function toDateOnly(value: string | Date) {
  if (typeof value === "string") {
    return value.slice(0, 10)
  }
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, "0")
  const day = String(value.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type StudentBucket = {
  studentId: string
  fullName: string
  studentProfile: string | null
  totalDueNum: number
  overDueNum: number
  overdueInvoiceCount: number
  openInvoices: OrgBillingOpenInvoice[]
}

export const getOrgBilling = withAuth<
  {
    search?: string
    page?: string
    perpage?: string
  },
  ActionResponse<GetOrgBillingResponse>
>({
  roles: ["orgUser"],
  permissions: {
    billing: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetOrgBillingResponse>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" }
    }

    const parsed = getOrgBillingSchema.safeParse(data ?? {})
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return { success: false, message: "Invalid request", fieldErrors }
    }

    const search = parsed.data.search?.toLowerCase()
    let page = parsePage(parsed.data.page)
    const perPage = parsePerPage(parsed.data.perpage)
    const today = format(new Date(), "yyyy-MM-dd")

    // One query: open invoices + student (via relation).
    const rows = await db.query.invoice.findMany({
      where: and(
        eq(invoice.organizationId, organizationId),
        inArray(invoice.status, ["unpaid", "partial"])
      ),
      columns: {
        id: true,
        studentId: true,
        invoiceNumber: true,
        periodYear: true,
        periodMonth: true,
        status: true,
        total: true,
        paidAmount: true,
        dueAmount: true,
        dueDate: true,
      },
      with: {
        student: {
          columns: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
      orderBy: [asc(invoice.periodYear), asc(invoice.periodMonth)],
    })

    const byStudent = new Map<string, StudentBucket>()

    for (const row of rows) {
      if (!row.student) continue
      if (row.status !== "unpaid" && row.status !== "partial") continue

      const dueDate = toDateOnly(row.dueDate)
      const dueAmount = toNumber(row.dueAmount)
      const isOverDue = dueDate < today && dueAmount > 0

      const openInvoice: OrgBillingOpenInvoice = {
        invoiceId: row.id,
        invoiceNumber: row.invoiceNumber,
        periodYear: row.periodYear,
        periodMonth: row.periodMonth,
        status: row.status,
        total: money(toNumber(row.total)),
        paidAmount: money(toNumber(row.paidAmount)),
        dueAmount: money(dueAmount),
        dueDate,
        isOverDue,
      }

      const existing = byStudent.get(row.studentId)
      if (!existing) {
        byStudent.set(row.studentId, {
          studentId: row.student.id,
          fullName: row.student.fullName,
          studentProfile: row.student.profileImage,
          totalDueNum: dueAmount,
          overDueNum: isOverDue ? dueAmount : 0,
          overdueInvoiceCount: isOverDue ? 1 : 0,
          openInvoices: [openInvoice],
        })
        continue
      }

      existing.totalDueNum += dueAmount
      if (isOverDue) {
        existing.overDueNum += dueAmount
        existing.overdueInvoiceCount += 1
      }
      existing.openInvoices.push(openInvoice)
    }

    // Org totals always include every student who owes (not search-filtered).
    let totalOutstandingAmount = 0
    let totalOverDueAmount = 0
    let overdueInvoiceCount = 0

    const allStudents = Array.from(byStudent.values())
    for (const student of allStudents) {
      totalOutstandingAmount += student.totalDueNum
      totalOverDueAmount += student.overDueNum
      overdueInvoiceCount += student.overdueInvoiceCount
    }

    const summary = {
      totalOutstanding: money(totalOutstandingAmount),
      overdueTotal: money(totalOverDueAmount),
      studentsWithDue: allStudents.length,
      overdueInvoiceCount,
    }

    if (allStudents.length === 0) {
      return {
        success: true,
        data: { summary, students: [], totalPages: 0 },
      }
    }

    const matched = allStudents
      .filter((student) =>
        search ? student.fullName.toLowerCase().includes(search) : true
      )
      .filter((student) => student.totalDueNum > 0)
      .sort((a, b) => b.totalDueNum - a.totalDueNum)

    const totalPages =
      matched.length === 0 ? 0 : Math.ceil(matched.length / perPage)

    if (totalPages > 0) {
      page = Math.min(page, totalPages)
    }

    const start = (page - 1) * perPage
    const students: OrgBillingStudentRow[] = matched
      .slice(start, start + perPage)
      .map((student) => ({
        studentId: student.studentId,
        fullName: student.fullName,
        studentProfile: student.studentProfile,
        totalDue: money(student.totalDueNum),
        overDue: money(student.overDueNum),
        openInvoiceCount: student.openInvoices.length,
        overdueInvoiceCount: student.overdueInvoiceCount,
        // First invoice is the oldest billing month (query is ordered by period).
        oldestDueDate: student.openInvoices[0]?.dueDate ?? null,
        openInvoices: student.openInvoices,
      }))

    return {
      success: true,
      data: { summary, students, totalPages },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong" }
  }
})
