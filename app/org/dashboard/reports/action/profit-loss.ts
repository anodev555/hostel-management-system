"use server"

import { and, eq, ne, sql } from "drizzle-orm"

import db from "@/db"
import { invoice, payment } from "@/db/schema"
import { expenses } from "@/db/schema/expenses-schema"
import { payrollInvoice, payrollPayment } from "@/db/schema/payroll-schema"
import { withAuth } from "@/lib/withAuth"
import type { ActionResponse } from "@/types/action-response"
import type { CategorySlice, ProfitLossData } from "@/types/profit-loss-types"
import type { ReportExpenseCategory } from "@/types/report-types"

import {
  buildMonthSeries,
  cashDateRangeFilter,
  cashMonthKey,
  monthKey,
  monthRangeFilter,
  rangeEndExclusiveDate,
  rangeStartDate,
  reportExpenseCategoryValues,
  reportRangeSchema,
  type ReportRangeType,
} from "../schema/report-schema"

/**
 * All money columns are `numeric(10,2)`, which Drizzle returns as strings.
 * Summing them with `+` concatenates, so every aggregate goes through this.
 */
function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const EXPENSE_LABELS: Record<ReportExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  maintenance: "Maintenance",
  fuel: "Fuel",
  food: "Food",
  other: "Other",
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function monthLabel(year: number, month: number) {
  return `${MONTH_LABELS[month - 1] ?? month} ${year}`
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function shareOf(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 1000) / 10
}

/**
 * Cash and outstanding view.
 *
 * Money in is measured on `payment.paidDate` and money out on
 * `payrollPayment.paidDate` / `expenses.expense_date`, i.e. when the cash
 * actually moved. Outstanding is the live `dueAmount` on invoices *raised*
 * inside the range. Those are different timelines, so `cash` and `outstanding`
 * are never added together into one figure; the two headline nets are each
 * internally consistent instead (see `ProfitLossData`).
 *
 * Exported unwrapped so `getReportsDataAction` can reuse it without nesting a
 * second `withAuth` check inside the first. Throws on failure.
 */
export async function computeProfitLoss(
  organizationId: string,
  range: ReportRangeType
): Promise<ProfitLossData> {
  const fromDate = rangeStartDate(range)
  const endExclusive = rangeEndExclusiveDate(range)
  const periodFrom = { year: range.fromYear, month: range.fromMonth }
  const periodTo = { year: range.toYear, month: range.toMonth }

  const [collectedRows, lateRow, invoiceRow, payrollPaidRows, payrollRow, expenseRows] =
    await Promise.all([
      // Money in, by the month the cash arrived.
      db
        .select({
          month: cashMonthKey(payment.paidDate),
          total: sql<string>`coalesce(sum(${payment.amount}), 0)`,
        })
        .from(payment)
        .where(
          and(
            eq(payment.organizationId, organizationId),
            cashDateRangeFilter(payment.paidDate, fromDate, endExclusive)
          )
        )
        .groupBy(cashMonthKey(payment.paidDate)),

      db
        .select({
          total: sql<string>`coalesce(sum(${payment.amount}) filter (where ${payment.isLate}), 0)`,
        })
        .from(payment)
        .where(
          and(
            eq(payment.organizationId, organizationId),
            cashDateRangeFilter(payment.paidDate, fromDate, endExclusive)
          )
        ),

      // What students were billed, and what they still owe, for invoices
      // raised inside the range.
      db
        .select({
          invoiced: sql<string>`coalesce(sum(${invoice.total}), 0)`,
          outstanding: sql<string>`coalesce(sum(${invoice.dueAmount}), 0)`,
        })
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            ne(invoice.status, "void"),
            monthRangeFilter(invoice.periodYear, invoice.periodMonth, periodFrom, periodTo)
          )
        ),

      // Money out to staff and teachers, by the month the cash left.
      db
        .select({
          month: cashMonthKey(payrollPayment.paidDate),
          total: sql<string>`coalesce(sum(${payrollPayment.amount}), 0)`,
        })
        .from(payrollPayment)
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            cashDateRangeFilter(payrollPayment.paidDate, fromDate, endExclusive)
          )
        )
        .groupBy(cashMonthKey(payrollPayment.paidDate)),

      // What payroll was invoiced, and what is still owed, for the range.
      db
        .select({
          invoiced: sql<string>`coalesce(sum(${payrollInvoice.total}), 0)`,
          outstanding: sql<string>`coalesce(sum(${payrollInvoice.dueAmount}), 0)`,
        })
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            ne(payrollInvoice.status, "void"),
            monthRangeFilter(
              payrollInvoice.periodYear,
              payrollInvoice.periodMonth,
              periodFrom,
              periodTo
            )
          )
        ),

      // Operational spending. The expenses table records money already spent,
      // so its month is when it went out.
      db
        .select({
          category: expenses.category,
          year: expenses.expenseYear,
          month: expenses.expenseMonth,
          total: sql<string>`coalesce(sum(${expenses.totalAmount}), 0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, organizationId),
            monthRangeFilter(
              expenses.expenseYear,
              expenses.expenseMonth,
              periodFrom,
              periodTo
            )
          )
        )
        .groupBy(expenses.category, expenses.expenseYear, expenses.expenseMonth),
    ])

  const collectedByMonth = new Map<string, number>()
  for (const row of collectedRows) {
    collectedByMonth.set(row.month, toNumber(row.total))
  }
  const payrollPaidByMonth = new Map<string, number>()
  for (const row of payrollPaidRows) {
    payrollPaidByMonth.set(row.month, toNumber(row.total))
  }

  const spentByMonth = new Map<string, number>()
  const spentByCategory = new Map<ReportExpenseCategory, number>()
  for (const row of expenseRows) {
    const amount = toNumber(row.total)
    spentByMonth.set(monthKey(row.year, row.month), (spentByMonth.get(monthKey(row.year, row.month)) ?? 0) + amount)
    spentByCategory.set(row.category, (spentByCategory.get(row.category) ?? 0) + amount)
  }

  const students = {
    cash: round2([...collectedByMonth.values()].reduce((a, b) => a + b, 0)),
    outstanding: round2(toNumber(invoiceRow[0]?.outstanding)),
    invoiced: round2(toNumber(invoiceRow[0]?.invoiced)),
    collectedLate: round2(toNumber(lateRow[0]?.total)),
  }

  const payroll = {
    cash: round2([...payrollPaidByMonth.values()].reduce((a, b) => a + b, 0)),
    outstanding: round2(toNumber(payrollRow[0]?.outstanding)),
    invoiced: round2(toNumber(payrollRow[0]?.invoiced)),
  }

  const operationsCash = round2(
    [...spentByCategory.values()].reduce((a, b) => a + b, 0)
  )

  const categoryTotals: CategorySlice[] = reportExpenseCategoryValues.map(
    (category) => {
      const total = round2(spentByCategory.get(category) ?? 0)
      return {
        category,
        label: EXPENSE_LABELS[category],
        total,
        share: shareOf(total, operationsCash),
      }
    }
  )

  const operations = {
    cash: operationsCash,
    // The expenses table has no status column and no payable lifecycle: a row
    // only exists once the money has already gone. Nothing is ever owed.
    outstanding: 0,
    invoiced: 0,
    categoryTotals,
  }

  const monthly = buildMonthSeries(periodFrom, periodTo, (year, month) => {
    const key = monthKey(year, month)
    const collected = collectedByMonth.get(key) ?? 0
    const payrollPaid = payrollPaidByMonth.get(key) ?? 0
    const operationsSpent = spentByMonth.get(key) ?? 0
    return {
      key,
      label: monthLabel(year, month),
      collected: round2(collected),
      payrollPaid: round2(payrollPaid),
      operationsSpent: round2(operationsSpent),
      netCash: round2(collected - payrollPaid - operationsSpent),
    }
  })

  return {
    range,
    students,
    payroll,
    operations,
    netCash: round2(students.cash - payroll.cash - operations.cash),
    // Invoiced basis, not cash + outstanding: the two are on different
    // timelines and would not reconcile.
    netPosition: round2(students.invoiced - payroll.invoiced - operations.cash),
    monthly,
  }
}

/** Auth-wrapped entry point, for callers outside the reports page. */
export const getProfitLossAction = withAuth<
  ReportRangeType,
  ActionResponse<ProfitLossData>
>({
  roles: ["orgUser"],
  permissions: { report: ["read"] },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<ProfitLossData>> => {
  const parsed = reportRangeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, message: "Invalid report range" }
  }
  if (!organizationId) {
    return { success: false, message: "No organization id found" }
  }
  try {
    return {
      success: true,
      message: "Cash and outstanding fetched successfully",
      data: await computeProfitLoss(organizationId, parsed.data),
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch profit and loss" }
  }
})
