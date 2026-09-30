import { sql } from "drizzle-orm"
import type { AnyColumn } from "drizzle-orm"
import { z } from "zod"

export const reportCategoryValues = [
  "tuition",
  "lodging",
  "food",
  "fine",
] as const

export const reportExpenseCategoryValues = [
  "rent",
  "utilities",
  "maintenance",
  "fuel",
  "food",
  "other",
] as const

export const reportPayeeTypeValues = ["staff", "teacher"] as const

/** Upper bound on a single report range, to keep aggregates cheap. */
export const MAX_RANGE_MONTHS = 24

export const DEFAULT_RANGE_MONTHS = 6

const yearSchema = z.coerce
  .number()
  .int("Invalid year")
  .min(2000, "Year must be 2000 or later")
  .max(2100, "Year must be 2100 or earlier")

const monthSchema = z.coerce
  .number()
  .int("Invalid month")
  .min(1, "Month must be between 1 and 12")
  .max(12, "Month must be between 1 and 12")

/**
 * Month-range scoping for every report. A range is expressed as an
 * inclusive (fromYear, fromMonth) -> (toYear, toMonth) pair rather than raw
 * dates, because every underlying table stores a denormalised year/month pair
 * instead of a single date column.
 */
export const reportRangeSchema = z
  .object({
    fromYear: yearSchema,
    fromMonth: monthSchema,
    toYear: yearSchema,
    toMonth: monthSchema,
  })
  .refine(
    (value) =>
      value.toYear > value.fromYear ||
      (value.toYear === value.fromYear && value.toMonth >= value.fromMonth),
    { message: "End month must be after the start month", path: ["toMonth"] }
  )
  .refine(
    (value) => monthDistance(value.fromYear, value.fromMonth, value.toYear, value.toMonth) <=
      MAX_RANGE_MONTHS,
    {
      message: `Range cannot exceed ${MAX_RANGE_MONTHS} months`,
      path: ["toYear"],
    }
  )

export type ReportRangeType = z.infer<typeof reportRangeSchema>

/** Whole months between two year/month pairs. */
export function monthDistance(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number
): number {
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

function pad2(value: number) {
  return String(value).padStart(2, "0")
}

/** First calendar day of the range, as `YYYY-MM-DD`. */
export function rangeStartDate(range: ReportRangeType) {
  return `${range.fromYear}-${pad2(range.fromMonth)}-01`
}

/**
 * The instant *after* the range ends: the first day of the month following
 * `toMonth`, as `YYYY-MM-DD`.
 *
 * Used as an exclusive upper bound rather than "last day of `toMonth`" because
 * `paid_at` is a timestamp with a time component. An inclusive `<= lastDay` on a
 * date would drop anything recorded after midnight on the final day.
 */
export function rangeEndExclusiveDate(range: ReportRangeType) {
  let year = range.toYear
  let month = range.toMonth + 1
  if (month > 12) {
    month = 1
    year += 1
  }
  return `${year}-${pad2(month)}-01`
}

/**
 * Date-range filter for cash tables.
 *
 * `payment.paidAt` and `payrollPayment.paidAt` are timestamps, not the
 * denormalised year/month pair every other reportable table uses, so
 * `monthRangeFilter` cannot apply.
 *
 * The column is compared **bare**, never wrapped in a function. An earlier
 * version used
 * `make_date(extract(year from paid_at)::int, extract(month from paid_at)::int, 1)`
 * which is correct but *non-sargable*: `paid_at` only appears inside the
 * expression, so it lands in the plan's `Filter` and no index on `paid_at` can
 * ever be used, no matter what indexes exist. A direct `>= / <` range keeps the
 * column visible so a `(organization_id, paid_at)` index would be used if one
 * is ever added, and skips two per-row function calls besides.
 *
 * `to_char(paid_at, 'YYYY-MM')` is still fine for *grouping* (see
 * `cashMonthKey`) because grouping does not need index support.
 */
export function cashDateRangeFilter(
  paidAtColumn: AnyColumn,
  startDate: string,
  endExclusiveDate: string
) {
  return sql`${paidAtColumn} >= ${startDate}::timestamp and ${paidAtColumn} < ${endExclusiveDate}::timestamp`
}

/** `YYYY-MM` bucket for a timestamp column, safe to group by. */
export function cashMonthKey(paidAtColumn: AnyColumn) {
  return sql<string>`to_char(${paidAtColumn}, 'YYYY-MM')`
}

/** A single bucket key used for grouping and zero-filling month series. */
export type MonthKey = string

/**
 * Default window: the last `monthsBack + 1` months, ending at the current one.
 *
 * Lives in this server-safe module rather than next to the filter UI on
 * purpose. A plain function exported from a `"use client"` file becomes a
 * client reference when imported by a server component, and calling it during
 * a server render throws.
 */
export function defaultRange(monthsBack = DEFAULT_RANGE_MONTHS - 1) {
  const now = new Date()
  const to = { year: now.getFullYear(), month: now.getMonth() + 1 }
  let year = to.year
  let month = to.month - monthsBack
  while (month < 1) {
    month += 12
    year -= 1
  }
  return { from: { year, month }, to }
}

export function monthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, "0")}`
}

/**
 * SQL tuple comparison `(year, month) BETWEEN (from) AND (to)`.
 *
 * Filtering the year and month columns independently is wrong: `month` is
 * only 1-12, so a plain `month <= toMonth` would silently pull in January of
 * the following year. A row constructor compares the pair lexicographically,
 * which is the only correct formulation for denormalised year/month columns.
 */
export function monthRangeFilter(
  yearColumn: AnyColumn,
  monthColumn: AnyColumn,
  from: { year: number; month: number },
  to: { year: number; month: number }
) {
  return sql`(${yearColumn}, ${monthColumn}) between (${from.year}, ${from.month}) and (${to.year}, ${to.month})`
}

/**
 * Zero-fill a month series so charts render continuous lines instead of
 * gaps. Keys are produced by `keyOf`; the callback seeds one row per month.
 */
export function buildMonthSeries<T>(
  from: { year: number; month: number },
  to: { year: number; month: number },
  keyOf: (year: number, month: number) => T
): T[] {
  const series: T[] = []
  const count = Math.min(
    monthDistance(from.year, from.month, to.year, to.month) + 1,
    MAX_RANGE_MONTHS + 1
  )
  let year = from.year
  let month = from.month
  for (let i = 0; i < count; i++) {
    series.push(keyOf(year, month))
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return series
}
