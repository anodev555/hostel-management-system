import db from "@/db"
import {
  payrollContract,
  payrollInvoice,
  payrollInvoiceLineItem,
} from "@/db/schema"
import { or, and, ne, lte, gte, eq, isNull } from "drizzle-orm"
import type { PreviousMonthType } from "./getPreviousMonth"
import { format } from "date-fns"

function money(amount: number) {
  return amount.toFixed(2)
}
function lineDescription(line: Line) {
  const label = line.payeeType === "staff" ? "Staff" : "Teacher"
  return `${label} Salary (${line.chargeStartAt} – ${line.chargeEndAt}, ${line.daysCharged}/${line.daysInMonth} days)`
}

export type GeneratePayrollInvoicesPerOrgResponse = {
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
  invoices: GeneratedPayrollInvoice[]
}

export type GeneratedPayrollInvoice = {
  invoiceId: string
  payeeType: "staff" | "teacher"
  payeeId: string
  invoiceNumber: string
  total: string
  invoiceItemsCount: number
}

type Line = {
  organizationId: string
  payeeType: "staff" | "teacher"
  payeeId: string
  contractId: string
  amount: number
  chargeStartAt: string
  chargeEndAt: string
  daysCharged: number
  daysInMonth: number
  isProrated: boolean
}

type GeneratePayrollInvoicesPerOrgType = {
  orgId: string
  period: PreviousMonthType
}

export default async function generatePayrollInvoicesPerOrg({
  orgId,
  period,
}: GeneratePayrollInvoicesPerOrgType): Promise<GeneratePayrollInvoicesPerOrgResponse> {
  const { periodStart, periodEnd, year, month, daysInMonth } = period

  const rows = await db
    .select()
    .from(payrollContract)
    .where(
      and(
        eq(payrollContract.organizationId, orgId),
        lte(payrollContract.effectiveFrom, periodEnd),
        or(
          isNull(payrollContract.effectiveTo),
          gte(payrollContract.effectiveTo, periodStart)
        )
      )
    )

  const lines = rows.flatMap((row): Line[] => {
    const payeeId = row.payeeType === "staff" ? row.memberId : row.teacherId
    if (!payeeId) return []

    const chargeStart =
      row.effectiveFrom > periodStart ? row.effectiveFrom : periodStart // if contract starts in middle of the month, use that as chargeStart or use periodStart i.e. first day of the month

    const chargeEnd =
      (row.effectiveTo ?? periodEnd) < periodEnd
        ? (row.effectiveTo ?? periodEnd)
        : periodEnd // if contract ends in middle of the month, use that as chargeEnd or use periodEnd i.e. last day of the month, if endDate is not set, use periodEnd

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
        payeeType: row.payeeType,
        payeeId,
        contractId: row.id,
        amount,
        chargeStartAt: chargeStart,
        chargeEndAt: chargeEnd,
        daysCharged: daysChargedInMonth,
        daysInMonth,
        isProrated: daysChargedInMonth < daysInMonth,
      },
    ]
  })

  //for storing invoices with line items for each payee
  const drafts = new Map<
    string,
    { payeeType: "staff" | "teacher"; payeeId: string; lines: Line[]; subTotal: number }
  >()

  for (const line of lines) {
    const key = `${line.payeeType}:${line.payeeId}`
    const existing = drafts.get(key)
    if (existing) {
      existing.lines.push(line)
      existing.subTotal = Number(existing.subTotal + line.amount)
    } else {
      drafts.set(key, {
        payeeType: line.payeeType,
        payeeId: line.payeeId,
        lines: [line],
        subTotal: Number(line.amount),
      })
    }
  }

  const existingInvoices = await db
    .select({
      id: payrollInvoice.id,
      payeeType: payrollInvoice.payeeType,
      memberId: payrollInvoice.memberId,
      teacherId: payrollInvoice.teacherId,
    })
    .from(payrollInvoice)
    .where(
      and(
        eq(payrollInvoice.organizationId, orgId),
        eq(payrollInvoice.periodYear, year),
        eq(payrollInvoice.periodMonth, month),
        ne(payrollInvoice.status, "void")
      )
    )

  const alreadyBilled = new Set(
    existingInvoices.map((invoice) =>
      invoice.payeeType === "staff"
        ? `staff:${invoice.memberId}`
        : `teacher:${invoice.teacherId}`
    )
  )
  const dueDate = format(new Date(Date.now() + 5 * 86_400_000), "yyyy-MM-dd")

  const created: GeneratedPayrollInvoice[] = []

  await db.transaction(async (tx) => {
    for (const draft of drafts.values()) {
      const key = `${draft.payeeType}:${draft.payeeId}`
      if (alreadyBilled.has(key) || draft.subTotal <= 0) continue

      const [inv] = await tx
        .insert(payrollInvoice)
        .values({
          organizationId: orgId,
          payeeType: draft.payeeType,
          memberId: draft.payeeType === "staff" ? draft.payeeId : null,
          teacherId: draft.payeeType === "teacher" ? draft.payeeId : null,
          invoiceNumber: `PAY${year}${month}${draft.payeeId.slice(0, 8)}`,
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
          id: payrollInvoice.id,
        })

      if (!inv) {
        throw new Error("Failed to create payroll invoice")
      }

      await tx.insert(payrollInvoiceLineItem).values(
        draft.lines.map((line) => ({
          payrollInvoiceId: inv.id,
          organizationId: orgId,
          description: lineDescription(line),
          amount: money(line.amount),
          chargeStartAt: line.chargeStartAt,
          chargeEndAt: line.chargeEndAt,
          daysCharged: line.daysCharged,
          daysInMonth: line.daysInMonth,
          isProrated: line.isProrated,
          contractId: line.contractId,
        }))
      )

      created.push({
        invoiceId: inv.id,
        payeeType: draft.payeeType,
        payeeId: draft.payeeId,
        invoiceNumber: `PAY-${year}-${month}-${draft.payeeId.slice(0, 8)}`,
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