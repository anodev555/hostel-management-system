import db from "@/db"
import {
  invoice,
  invoiceLineItem,
  studentBillableAssignment,
  studentFineAssignment,
} from "@/db/schema"
import { or, and, ne, lte, gte, eq, inArray } from "drizzle-orm"
import { isNull } from "drizzle-orm"
import type { PreviousMonthType } from "./getPreviousMonth"
import { format } from "date-fns"

function money(amount: number) {
  return amount.toFixed(2)
}
function lineDescription(line: Line) {
  if (line.category === "fine") return "Fine"
  const label =
    line.category === "food"
      ? "Food"
      : line.category === "lodging"
        ? "Lodging"
        : "Tuition"
  return `${label} (${line.chargeStartAt} – ${line.chargeEndAt}, ${line.daysCharged}/${line.daysInMonth} days)`
}

export type GenerateInvoicesPerOrgResponse = {
  organizationId: string
  status: "created" | "empty"
  period: {
    year: number
    month: number
    periodStart: string
    periodEnd: string
  }
  createdCount: number
  skippedCount: number
  lineCount: number
  invoices: GeneratedInvoice[]
}

export type GeneratedInvoice = {
  invoiceId: string
  studentId: string
  invoiceNumber: string
  total: string
  invoiceItemsCount: number
}
type Line = {
  organizationId: string
  studentId: string
  assignmentId: string
  category: "food" | "lodging" | "tuition" | "fine"
  amount: number
  chargeStartAt: string | null
  chargeEndAt: string | null
  daysCharged: number | null
  daysInMonth: number | null
  isProrated: boolean
}
type GenerateInvoicesPerOrgType = {
  orgId: string
  period: PreviousMonthType
}
export default async function generateInvoicesPerOrg({
  orgId,
  period,
}: GenerateInvoicesPerOrgType): Promise<GenerateInvoicesPerOrgResponse> {
  const { periodStart, periodEnd, year, month, daysInMonth } = period

  const rows = await db
    .select()
    .from(studentBillableAssignment)
    .where(
      and(
        eq(studentBillableAssignment.organizationId, orgId),
        or(
          //for recurring monthly bills
          and(
            ne(studentBillableAssignment.category, "fine"),
            lte(studentBillableAssignment.startDate, periodEnd),

            or(
              isNull(studentBillableAssignment.endDate),
              gte(studentBillableAssignment.endDate, periodStart)
            )
          ),
          //for fines one time bills
          and(
            eq(studentBillableAssignment.category, "fine"),
            eq(studentBillableAssignment.status, "pending"),
            lte(studentBillableAssignment.startDate, periodEnd)
          )
        )
      )
    )

  const lines = rows.flatMap((row): Line[] => {
    //fines
    if (row.category === "fine") {
      return [
        {
          organizationId: row.organizationId,
          studentId: row.studentId,
          assignmentId: row.assignmentId,
          category: row.category,
          amount: Number(row.monthlyAmount),
          chargeStartAt: null,
          chargeEndAt: null,
          daysCharged: null,
          daysInMonth: null,
          isProrated: false,
        },
      ]
    }

    //for recurring monthly bills

    const chargeStart =
      row.startDate > periodStart ? row.startDate : periodStart // if startDate is in middle of the month, use startDate as chargeStart or use periodStart i.e. first day of the month

    const chargeEnd =
      (row.endDate ?? periodEnd) < periodEnd
        ? (row.endDate ?? periodEnd)
        : periodEnd // if endDate is in middle of the month, use endDate as chargeEnd or use periodEnd i.e. last day of the month, if endDate is not set, use periodEnd

    const from = new Date(`${chargeStart}T00:00:00`)
    const to = new Date(`${chargeEnd}T00:00:00`)
    const daysChargedInMonth =
      Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1 // 86_400_000 is the number of milliseconds in a day, +1 is to include the start date

    const amount = Math.round(
      Number(row.monthlyAmount) * (daysChargedInMonth / daysInMonth)
    )

    if (amount <= 0 || daysChargedInMonth < 1) return []

    return [
      {
        organizationId: row.organizationId,
        studentId: row.studentId,
        assignmentId: row.assignmentId,
        category: row.category as Line["category"],
        amount: amount,
        chargeStartAt: chargeStart,
        chargeEndAt: chargeEnd,
        daysCharged: daysChargedInMonth,
        daysInMonth: daysInMonth,
        isProrated: daysChargedInMonth < daysInMonth,
      },
    ]
  })
  //for storing invoices with line items for each student
  const drafts = new Map<
    string,
    { studentId: string; lines: Line[]; subTotal: number }
  >()

  for (const line of lines) {
    const existing = drafts.get(line.studentId)
    if (existing) {
      existing.lines.push(line)
      existing.subTotal = Number(existing.subTotal + line.amount)
    } else {
      drafts.set(line.studentId, {
        studentId: line.studentId,
        lines: [line],
        subTotal: Number(line.amount),
      })
    }
  }

  const existingInvoices = await db
    .select({ studentId: invoice.studentId })
    .from(invoice)
    .where(
      and(
        eq(invoice.organizationId, orgId),
        eq(invoice.periodYear, year),
        eq(invoice.periodMonth, month),
        ne(invoice.status, "void")
      )
    )

  const alreadyBilled = new Set(
    existingInvoices.map((invoice) => invoice.studentId)
  )
  const dueDate = format(new Date(Date.now() + 5 * 86_400_000), "yyyy-MM-dd")

  const created: GeneratedInvoice[] = []

  await db.transaction(async (tx) => {
    for (const draft of drafts.values()) {
      if (alreadyBilled.has(draft.studentId) || draft.subTotal <= 0) continue

      const [inv] = await tx
        .insert(invoice)
        .values({
          organizationId: orgId,
          studentId: draft.studentId,
          invoiceNumber: `INV${year}${month}${draft.studentId.slice(0, 8)}`,
          periodYear: year,
          periodMonth: month,
          periodStart: periodStart,
          periodEnd: periodEnd,
          dueDate: dueDate,
          subTotal: money(draft.subTotal),
          total: money(draft.subTotal),
          paidAmount: "0.00",
          dueAmount: money(draft.subTotal),
          status: "unpaid",
        })
        .returning({
          id: invoice.id,
        })

      if (!inv) {
        throw new Error("Failed to create invoice")
      }

      await tx.insert(invoiceLineItem).values(
        draft.lines.map((line) => ({
          invoiceId: inv.id,
          organizationId: orgId,
          category: line.category,
          description: lineDescription(line),
          amount: money(line.amount),
          chargeStartAt: line.chargeStartAt,
          chargeEndAt: line.chargeEndAt,
          daysCharged: line.daysCharged,
          daysInMonth: line.daysInMonth,
          isProrated: line.isProrated,
          assignmentId: line.assignmentId,
        }))
      )

      const fineIds = draft.lines
        .filter((line) => line.category === "fine")
        .map((line) => line.assignmentId)

      if (fineIds.length > 0) {
        await tx
          .update(studentFineAssignment)
          .set({
            status: "billed",
            billedInvoiceId: inv.id,
            billedAt: new Date(),
          })
          .where(inArray(studentFineAssignment.id, fineIds))
      }

      created.push({
        invoiceId: inv.id,
        studentId: draft.studentId,
        invoiceNumber: `INV-${year}-${month}-${draft.studentId.slice(0, 8)}`,
        total: money(draft.subTotal),
        invoiceItemsCount: draft.lines.length,
      })
    }
  })

  return {
    organizationId: orgId,
    status: created.length === 0 ? "empty" : "created",
    period: {
      year,
      month,
      periodStart,
      periodEnd,
    },
    createdCount: created.length,
    skippedCount: alreadyBilled.size,
    lineCount: created.reduce(
      (acc, invoice) => acc + invoice.invoiceItemsCount,
      0
    ),
    invoices: created,
  }
}
