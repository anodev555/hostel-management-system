"use server"

import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { invoice, invoiceLineItem, student } from "@/db/schema"
import { and, count, desc, eq, inArray, lt, ne, sum } from "drizzle-orm"
import db from "@/db"
import { GetInvoicesPerStudentResponse } from "@/types/invoice-type"
import z from "zod"

const getInvoicesPerStudentSchema = z.object({
  studentId: z.uuid("Invalid student ID"),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(20).optional(),
})

export type GetInvoicesPerStudentInput = z.infer<
  typeof getInvoicesPerStudentSchema
>
export const getInvoicesPerStudent = withAuth<
  GetInvoicesPerStudentInput,
  ActionResponse<GetInvoicesPerStudentResponse>
>({
  roles: ["orgUser"],
  permissions: {
    invoice: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetInvoicesPerStudentResponse>> => {
  try {
    if (!organizationId)
      return {
        success: false,
        message: "Organization not found",
      }

    const parsed = getInvoicesPerStudentSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid request",
        fieldErrors,
      }
    }

    const { studentId } = parsed.data

    const page = parsed.data.page ?? 1
    const perPage = parsed.data.perPage ?? 12
    const offset = (page - 1) * perPage
    const today = new Date().toISOString().slice(0, 10)

    //check if student exists
    const [studentRow] = await db
      .select({
        id: student.id,
        fullName: student.fullName,
        profileImage: student.profileImage,
      })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow)
      return {
        success: false,
        message: "Student not found",
      }

    //get total summary

    const [
      [{ totalBilled }],
      [{ totalPaid }],
      [{ totalDue }],
      [{ overDueCount }],
      [{ totalCount }],
    ] = await Promise.all([
      db
        .select({ totalBilled: sum(invoice.total) })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.studentId, studentId),
            ne(invoice.status, "void")
          )
        ),

      db
        .select({ totalPaid: sum(invoice.paidAmount) })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.studentId, studentId),
            ne(invoice.status, "void")
          )
        ),

      db
        .select({ totalDue: sum(invoice.dueAmount) })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.studentId, studentId),
            ne(invoice.status, "void"),
            inArray(invoice.status, ["unpaid", "partial"])
          )
        ),

      db
        .select({ overDueCount: count() })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.studentId, studentId),
            ne(invoice.status, "void"),
            ne(invoice.status, "paid"),
            lt(invoice.dueDate, today)
          )
        ),
      db
        .select({ totalCount: count() })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.studentId, studentId)
          )
        ),
    ])

    const totalInvoices = Number(totalCount)
    const totalPages =
      totalInvoices === 0 ? 0 : Math.ceil(totalInvoices / perPage)

    //get invoices data
    const invoicesRows = await db
      .select()
      .from(invoice)
      .where(
        and(
          eq(invoice.organizationId, organizationId),
          eq(invoice.studentId, studentId)
        )
      )
      .limit(perPage)
      .offset(offset)
      .orderBy(desc(invoice.periodYear), desc(invoice.periodMonth))

    const invoicesIds = invoicesRows.map((inv) => inv.id)

    const lineItemsRows =
      invoicesIds.length > 0
        ? await db
            .select({
              id: invoiceLineItem.id,
              invoiceId: invoiceLineItem.invoiceId,
              category: invoiceLineItem.category,
              amount: invoiceLineItem.amount,
              description: invoiceLineItem.description,
              chargeStartAt: invoiceLineItem.chargeStartAt,
              chargeEndAt: invoiceLineItem.chargeEndAt,
              daysCharged: invoiceLineItem.daysCharged,
              daysInMonth: invoiceLineItem.daysInMonth,
              isProrated: invoiceLineItem.isProrated,
            })
            .from(invoiceLineItem)
            .where(
              and(
                eq(invoiceLineItem.organizationId, organizationId),
                inArray(invoiceLineItem.invoiceId, invoicesIds)
              )
            )
        : []

    const lineItemsByInvoice = new Map<string, typeof lineItemsRows>()
    for (const item of lineItemsRows) {
      const list = lineItemsByInvoice.get(item.invoiceId) ?? []
      list.push(item)
      lineItemsByInvoice.set(item.invoiceId, list)
    }
    const invoices = invoicesRows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      periodYear: row.periodYear,
      periodMonth: row.periodMonth,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      issuedAt: row.issuedAt,
      dueDate: row.dueDate,
      subTotal: row.subTotal,
      total: row.total,
      paidAmount: row.paidAmount,
      dueAmount: row.dueAmount,
      status: row.status,
      notes: row.notes,
      isOverDue:
        row.status !== "paid" && new Date(row.dueDate) < new Date(today),
      lineItems: lineItemsByInvoice.get(row.id) ?? [],
    }))

    return {
      success: true,
      data: {
        student: studentRow,
        summary: {
          totalBilled: totalBilled ?? "0",
          totalPaid: totalPaid ?? "0",
          totalDue: totalDue ?? "0",
          overDueCount: overDueCount ?? 0,
          totalCount: totalCount ?? 0,
          totalPages: totalPages,
        },

        invoices,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
