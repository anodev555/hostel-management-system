import type { ReportRangeType } from "@/app/org/dashboard/reports/schema/report-schema"
import type { ReportExpenseCategory } from "@/types/report-types"

export type { ReportRangeType }

/**
 * One side of the money flow.
 *
 * `cash` and `outstanding` are deliberately on different timelines and must
 * not be summed into a single "total": cash is measured when the money moved
 * (`payment.paidAt` / `payrollPayment.paidAt`), while outstanding is a live
 * balance on invoices *raised* in the range. Cash collected in a month can
 * settle an invoice from an earlier month, so the two never form a reliable
 * revenue total.
 */
export type FlowSide = {
  /** Money that actually moved inside the range. */
  cash: number
  /** Still owed on invoices raised inside the range (a live balance). */
  outstanding: number
  /**
   * Total invoiced inside the range, shown as context. For students this is
   * `invoice.total`; for payroll it is `payrollInvoice.total`; for operations
   * there is no invoice concept so it stays 0.
   */
  invoiced: number
}

export type CategorySlice = {
  category: ReportExpenseCategory
  label: string
  total: number
  /** Percentage of the operations total, 0-100, one decimal. */
  share: number
}

export type ProfitLossMonthlyPoint = {
  key: string
  label: string
  collected: number
  payrollPaid: number
  operationsSpent: number
  /** collected - payrollPaid - operationsSpent */
  netCash: number
}

export type ProfitLossData = {
  range: ReportRangeType
  /** Money in from students. */
  students: FlowSide & {
    /** Portion of `cash` that was flagged late at the time of payment. */
    collectedLate: number
  }
  /** Money out to staff and teachers. */
  payroll: FlowSide
  /**
   * Money out recorded in the expenses table. That table has no status column
   * and no payable lifecycle — a row is created once the money has already
   * gone — so `outstanding` is always 0 by construction, not by omission.
   */
  operations: FlowSide & {
    categoryTotals: CategorySlice[]
  }
  /** students.cash - payroll.cash - operations.cash */
  netCash: number
  /**
   * students.invoiced - payroll.invoiced - operations.cash.
   *
   * Deliberately on an invoiced basis, not `cash + outstanding`, because those
   * two come from different timelines and would not reconcile. Matches the
   * conventional accrual bottom line.
   */
  netPosition: number
  monthly: ProfitLossMonthlyPoint[]
}
