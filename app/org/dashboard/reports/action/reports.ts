"use server"

import { and, count, countDistinct, eq, ne, sql } from "drizzle-orm"

import db from "@/db"
import { invoice, invoiceLineItem, member, tuitionTeacher, user } from "@/db/schema"
import { expenses } from "@/db/schema/expenses-schema"
import { payrollContract, payrollInvoice } from "@/db/schema/payroll-schema"
import { withAuth } from "@/lib/withAuth"
import type { ActionResponse } from "@/types/action-response"
import type {
  ExpenseAnalysisData,
  PayrollPayeeRow,
  PayrollSummaryData,
  ReportCategory,
  ReportExpenseCategory,
  ReportPayeeType,
  ReportsData,
  RevenueByCategoryData,
} from "@/types/report-types"

import {
  buildMonthSeries,
  monthKey,
  monthRangeFilter,
  reportCategoryValues,
  reportExpenseCategoryValues,
  reportPayeeTypeValues,
  reportRangeSchema,
  type ReportRangeType,
} from "../schema/report-schema"
import { computeProfitLoss } from "./profit-loss"

/**
 * All money columns are `numeric(10,2)`, which Drizzle hands back as
 * strings. Summing them with `+` concatenates instead of adding, so every
 * aggregate in this file goes through `toNumber`.
 */
function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  tuition: "Tuition",
  lodging: "Lodging",
  food: "Food",
  fine: "Fines",
}

const EXPENSE_CATEGORY_LABELS: Record<ReportExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  maintenance: "Maintenance",
  fuel: "Fuel",
  food: "Food",
  other: "Other",
}

const PAYEE_LABELS: Record<ReportPayeeType, string> = {
  staff: "Staff",
  teacher: "Teacher",
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function monthLabel(year: number, month: number) {
  return `${MONTH_LABELS[month - 1] ?? month} ${year}`
}

function shareOf(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 1000) / 10
}

function toRange(raw: ReportRangeType) {
  return {
    from: { year: raw.fromYear, month: raw.fromMonth },
    to: { year: raw.toYear, month: raw.toMonth },
  }
}

function parseRange(data: unknown) {
  const parsed = reportRangeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid report range" } as const
  }
  return { range: parsed.data } as const
}

function emptyCategoryMap<T extends string>(
  values: readonly T[]
): Record<T, number> {
  return values.reduce(
    (acc, value) => {
      acc[value] = 0
      return acc
    },
    {} as Record<T, number>
  )
}

/* -------------------------------------------------------------------------- */
/* 1. Revenue by category                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Sums `invoice_line_item.amount` grouped by category and by month.
 *
 * Void invoices are excluded at the invoice level rather than the line level.
 * Amounts are aggregated instead of `status`, because no check constraint ties
 * `invoice.status` to the amount columns and the label can drift.
 */
async function getRevenueByCategory(
  organizationId: string,
  range: ReportRangeType
): Promise<RevenueByCategoryData> {
  const { from, to } = toRange(range)

  const rows = await db
    .select({
      category: invoiceLineItem.category,
      year: invoice.periodYear,
      month: invoice.periodMonth,
      total: sql<string>`coalesce(sum(${invoiceLineItem.amount}), 0)`,
      lineCount: count(invoiceLineItem.id),
    })
    .from(invoiceLineItem)
    .innerJoin(invoice, eq(invoiceLineItem.invoiceId, invoice.id))
    .where(
      and(
        eq(invoiceLineItem.organizationId, organizationId),
        ne(invoice.status, "void"),
        monthRangeFilter(invoice.periodYear, invoice.periodMonth, from, to)
      )
    )
    .groupBy(invoiceLineItem.category, invoice.periodYear, invoice.periodMonth)

  const [invoiceRow] = await db
    .select({
      invoiceCount: countDistinct(invoice.id),
    })
    .from(invoice)
    .where(
      and(
        eq(invoice.organizationId, organizationId),
        ne(invoice.status, "void"),
        monthRangeFilter(invoice.periodYear, invoice.periodMonth, from, to)
      )
    )

  const byCategory = emptyCategoryMap(reportCategoryValues)
  const byMonth = new Map<
    string,
    Record<ReportCategory, number>
  >()

  for (const row of rows) {
    const amount = toNumber(row.total)
    byCategory[row.category] += amount

    const key = monthKey(row.year, row.month)
    const bucket = byMonth.get(key) ?? emptyCategoryMap(reportCategoryValues)
    bucket[row.category] += amount
    byMonth.set(key, bucket)
  }

  const totalRevenue = reportCategoryValues.reduce(
    (sum, category) => sum + byCategory[category],
    0
  )

  const monthly = buildMonthSeries(from, to, (year, month) => {
    const key = monthKey(year, month)
    const bucket = byMonth.get(key) ?? emptyCategoryMap(reportCategoryValues)
    return {
      key,
      label: monthLabel(year, month),
      total: reportCategoryValues.reduce(
        (sum, category) => sum + bucket[category],
        0
      ),
      byCategory: { ...bucket },
    }
  })

  return {
    totalRevenue,
    lineCount: rows.reduce((sum, row) => sum + row.lineCount, 0),
    invoiceCount: invoiceRow?.invoiceCount ?? 0,
    categoryTotals: reportCategoryValues.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      total: byCategory[category],
      share: shareOf(byCategory[category], totalRevenue),
    })),
    monthly,
  }
}

export const getRevenueByCategoryAction = withAuth<
  ReportRangeType,
  ActionResponse<RevenueByCategoryData>
>({
  roles: ["orgUser"],
  permissions: { report: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<RevenueByCategoryData>> => {
  const parsed = parseRange(data)
  if ("error" in parsed) {
    return { success: false, message: parsed.error }
  }
  if (!organizationId) {
    return { success: false, message: "No organization id found" }
  }
  try {
    return {
      success: true,
      message: "Revenue report fetched successfully",
      data: await getRevenueByCategory(organizationId, parsed.range),
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch revenue report" }
  }
})

/* -------------------------------------------------------------------------- */
/* 2. Expense analysis                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Groups `expenses.totalAmount` by month and by category across the range.
 *
 * This deliberately does not reuse `getExpenseDashboardAction`, which is
 * hard-pinned to the current calendar month. It is a new query so the
 * existing Expenses page cannot regress.
 */
async function getExpenseAnalysis(
  organizationId: string,
  range: ReportRangeType
): Promise<ExpenseAnalysisData> {
  const { from, to } = toRange(range)

  const rows = await db
    .select({
      category: expenses.category,
      year: expenses.expenseYear,
      month: expenses.expenseMonth,
      total: sql<string>`coalesce(sum(${expenses.totalAmount}), 0)`,
      transactionCount: count(expenses.id),
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, organizationId),
        monthRangeFilter(expenses.expenseYear, expenses.expenseMonth, from, to)
      )
    )
    .groupBy(expenses.category, expenses.expenseYear, expenses.expenseMonth)

  const byCategory = emptyCategoryMap(reportExpenseCategoryValues)
  const byMonth = new Map<string, Record<ReportExpenseCategory, number>>()
  let transactionCount = 0

  for (const row of rows) {
    const amount = toNumber(row.total)
    byCategory[row.category] += amount
    transactionCount += row.transactionCount

    const key = monthKey(row.year, row.month)
    const bucket =
      byMonth.get(key) ?? emptyCategoryMap(reportExpenseCategoryValues)
    bucket[row.category] += amount
    byMonth.set(key, bucket)
  }

  const totalExpenses = reportExpenseCategoryValues.reduce(
    (sum, category) => sum + byCategory[category],
    0
  )

  const monthly = buildMonthSeries(from, to, (year, month) => {
    const key = monthKey(year, month)
    const bucket = byMonth.get(key) ?? emptyCategoryMap(reportExpenseCategoryValues)
    return {
      key,
      label: monthLabel(year, month),
      total: reportExpenseCategoryValues.reduce(
        (sum, category) => sum + bucket[category],
        0
      ),
      byCategory: { ...bucket },
    }
  })

  const categoryTotals = reportExpenseCategoryValues.map((category) => ({
    category,
    label: EXPENSE_CATEGORY_LABELS[category],
    total: byCategory[category],
    share: shareOf(byCategory[category], totalExpenses),
  }))

  const nonEmpty = categoryTotals.filter((item) => item.total > 0)

  return {
    totalExpenses,
    transactionCount,
    // Averaged over every month in range, including months with no spend, so
    // the figure stays comparable when the range changes.
    averagePerMonth: totalExpenses / Math.max(monthly.length, 1),
    topCategory: nonEmpty.length
      ? { ...nonEmpty.reduce((a, b) => (b.total > a.total ? b : a)) }
      : null,
    categoryTotals,
    monthly,
  }
}

export const getExpenseAnalysisAction = withAuth<
  ReportRangeType,
  ActionResponse<ExpenseAnalysisData>
>({
  roles: ["orgUser"],
  permissions: { report: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<ExpenseAnalysisData>> => {
  const parsed = parseRange(data)
  if ("error" in parsed) {
    return { success: false, message: parsed.error }
  }
  if (!organizationId) {
    return { success: false, message: "No organization id found" }
  }
  try {
    return {
      success: true,
      message: "Expense report fetched successfully",
      data: await getExpenseAnalysis(organizationId, parsed.range),
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch expense report" }
  }
})

/* -------------------------------------------------------------------------- */
/* 3. Payroll summary                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Splits payroll across staff and teachers.
 *
 * `activeRunRate` comes from currently open contracts and is a point-in-time
 * figure, so it is kept in its own field rather than being added into the
 * range-scoped totals.
 */
async function getPayrollSummary(
  organizationId: string,
  range: ReportRangeType
): Promise<PayrollSummaryData> {
  const { from, to } = toRange(range)

  const rows = await db
    .select({
      payeeType: payrollInvoice.payeeType,
      memberId: payrollInvoice.memberId,
      teacherId: payrollInvoice.teacherId,
      year: payrollInvoice.periodYear,
      month: payrollInvoice.periodMonth,
      total: sql<string>`coalesce(sum(${payrollInvoice.total}), 0)`,
      paid: sql<string>`coalesce(sum(${payrollInvoice.paidAmount}), 0)`,
      due: sql<string>`coalesce(sum(${payrollInvoice.dueAmount}), 0)`,
      invoiceCount: count(payrollInvoice.id),
      staffName: user.name,
      teacherName: tuitionTeacher.fullName,
    })
    .from(payrollInvoice)
    .leftJoin(member, eq(payrollInvoice.memberId, member.id))
    .leftJoin(user, eq(member.userId, user.id))
    .leftJoin(tuitionTeacher, eq(payrollInvoice.teacherId, tuitionTeacher.id))
    .where(
      and(
        eq(payrollInvoice.organizationId, organizationId),
        ne(payrollInvoice.status, "void"),
        monthRangeFilter(
          payrollInvoice.periodYear,
          payrollInvoice.periodMonth,
          from,
          to
        )
      )
    )
    .groupBy(
      payrollInvoice.payeeType,
      payrollInvoice.memberId,
      payrollInvoice.teacherId,
      payrollInvoice.periodYear,
      payrollInvoice.periodMonth,
      user.name,
      tuitionTeacher.fullName
    )

  const byTypeTotals = new Map<
    ReportPayeeType,
    { invoiced: number; paid: number; due: number }
  >()
  for (const payeeType of reportPayeeTypeValues) {
    byTypeTotals.set(payeeType, { invoiced: 0, paid: 0, due: 0 })
  }

  const byMonth = new Map<
    string,
    { invoiced: number; paid: number; due: number; staff: number; teacher: number }
  >()
  const payeeMap = new Map<string, PayrollPayeeRow>()
  let invoiceCount = 0

  // Point-in-time: contracts open right now, independent of the range.
  // Queried first so a payee holding a contract but invoiced nothing in the
  // range still appears in the table instead of silently disappearing while
  // still being counted in the run-rate below.
  const contractRows = await db
    .select({
      payeeType: payrollContract.payeeType,
      memberId: payrollContract.memberId,
      teacherId: payrollContract.teacherId,
      monthlyAmount: sql<string>`coalesce(sum(${payrollContract.monthlyAmount}), 0)`,
      contractCount: count(payrollContract.id),
      staffName: user.name,
      teacherName: tuitionTeacher.fullName,
    })
    .from(payrollContract)
    .leftJoin(member, eq(payrollContract.memberId, member.id))
    .leftJoin(user, eq(member.userId, user.id))
    .leftJoin(tuitionTeacher, eq(payrollContract.teacherId, tuitionTeacher.id))
    .where(
      and(
        eq(payrollContract.organizationId, organizationId),
        eq(payrollContract.status, "active"),
        sql`${payrollContract.effectiveTo} is null`
      )
    )
    .groupBy(
      payrollContract.payeeType,
      payrollContract.memberId,
      payrollContract.teacherId,
      user.name,
      tuitionTeacher.fullName
    )

  const activeRunRate = {
    staff: 0,
    teacher: 0,
    total: 0,
    staffCount: 0,
    teacherCount: 0,
  }

  for (const row of contractRows) {
    const amount = toNumber(row.monthlyAmount)
    activeRunRate.total += amount
    if (row.payeeType === "staff") {
      activeRunRate.staff += amount
      activeRunRate.staffCount += 1
    } else {
      activeRunRate.teacher += amount
      activeRunRate.teacherCount += 1
    }

    const payeeId = row.teacherId ?? row.memberId
    if (!payeeId) continue
    payeeMap.set(`${row.payeeType}:${payeeId}`, {
      payeeType: row.payeeType,
      payeeId,
      payeeName:
        (row.payeeType === "staff" ? row.staffName : row.teacherName) ??
        PAYEE_LABELS[row.payeeType],
      contracted: amount,
      invoiced: 0,
      paid: 0,
      due: 0,
    })
  }

  for (const row of rows) {
    const invoiced = toNumber(row.total)
    const paid = toNumber(row.paid)
    const due = toNumber(row.due)
    invoiceCount += row.invoiceCount

    const typeTotals = byTypeTotals.get(row.payeeType)!
    typeTotals.invoiced += invoiced
    typeTotals.paid += paid
    typeTotals.due += due

    const key = monthKey(row.year, row.month)
    const bucket =
      byMonth.get(key) ??
      { invoiced: 0, paid: 0, due: 0, staff: 0, teacher: 0 }
    bucket.invoiced += invoiced
    bucket.paid += paid
    bucket.due += due
    if (row.payeeType === "staff") bucket.staff += invoiced
    else bucket.teacher += invoiced
    byMonth.set(key, bucket)

    const payeeId = row.teacherId ?? row.memberId
    if (!payeeId) continue
    const payeeKey = `${row.payeeType}:${payeeId}`
    const existing = payeeMap.get(payeeKey)
    if (existing) {
      existing.invoiced += invoiced
      existing.paid += paid
      existing.due += due
    } else {
      payeeMap.set(payeeKey, {
        payeeType: row.payeeType,
        payeeId,
        payeeName:
          (row.payeeType === "staff" ? row.staffName : row.teacherName) ??
          PAYEE_LABELS[row.payeeType],
        contracted: null,
        invoiced,
        paid,
        due,
      })
    }
  }

  const monthly = buildMonthSeries(from, to, (year, month) => {
    const key = monthKey(year, month)
    const bucket = byMonth.get(key) ?? {
      invoiced: 0,
      paid: 0,
      due: 0,
      staff: 0,
      teacher: 0,
    }
    return {
      key,
      label: monthLabel(year, month),
      invoiced: bucket.invoiced,
      paid: bucket.paid,
      due: bucket.due,
      staffInvoiced: bucket.staff,
      teacherInvoiced: bucket.teacher,
    }
  })

  const byType = reportPayeeTypeValues.map((payeeType) => ({
    payeeType,
    label: PAYEE_LABELS[payeeType],
    ...byTypeTotals.get(payeeType)!,
  }))

  return {
    totalInvoiced: byType.reduce((sum, item) => sum + item.invoiced, 0),
    totalPaid: byType.reduce((sum, item) => sum + item.paid, 0),
    totalDue: byType.reduce((sum, item) => sum + item.due, 0),
    invoiceCount,
    payeeCount: payeeMap.size,
    activeRunRate,
    byType,
    monthly,
    payees: [...payeeMap.values()].sort(
      (a, b) => b.due - a.due || b.invoiced - a.invoiced
    ),
  }
}

export const getPayrollSummaryAction = withAuth<
  ReportRangeType,
  ActionResponse<PayrollSummaryData>
>({
  roles: ["orgUser"],
  permissions: { report: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<PayrollSummaryData>> => {
  const parsed = parseRange(data)
  if ("error" in parsed) {
    return { success: false, message: parsed.error }
  }
  if (!organizationId) {
    return { success: false, message: "No organization id found" }
  }
  try {
    return {
      success: true,
      message: "Payroll report fetched successfully",
      data: await getPayrollSummary(organizationId, parsed.range),
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch payroll report" }
  }
})

/* -------------------------------------------------------------------------- */
/* All reports, one page pass                                                   */
/* -------------------------------------------------------------------------- */

export const getReportsDataAction = withAuth<
  ReportRangeType,
  ActionResponse<ReportsData>
>({
  roles: ["orgUser"],
  permissions: { report: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<ReportsData>> => {
  const parsed = parseRange(data)
  if ("error" in parsed) {
    return { success: false, message: parsed.error }
  }
  if (!organizationId) {
    return { success: false, message: "No organization id found" }
  }
  try {
    const range = parsed.range
    const [revenue, expenseReport, payroll, profitLoss] = await Promise.all([
      getRevenueByCategory(organizationId, range),
      getExpenseAnalysis(organizationId, range),
      getPayrollSummary(organizationId, range),
      computeProfitLoss(organizationId, range),
    ])

    return {
      success: true,
      message: "Reports fetched successfully",
      data: {
        range: {
          fromYear: range.fromYear,
          fromMonth: range.fromMonth,
          toYear: range.toYear,
          toMonth: range.toMonth,
        },
        revenue,
        expenses: expenseReport,
        payroll,
        profitLoss,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch reports" }
  }
})
