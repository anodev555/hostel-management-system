import type {
  reportCategoryValues,
  reportExpenseCategoryValues,
  reportPayeeTypeValues,
} from "@/app/org/dashboard/reports/schema/report-schema"

export type ReportCategory = (typeof reportCategoryValues)[number]
export type ReportExpenseCategory = (typeof reportExpenseCategoryValues)[number]
export type ReportPayeeType = (typeof reportPayeeTypeValues)[number]

/** One month bucket. Values are numbers, never numeric strings. */
export type MonthPoint = {
  /** "YYYY-MM" */
  key: string
  /** Human label, e.g. "Sep 2026". */
  label: string
}

export type RevenueByCategoryData = {
  /** Summed across every non-void invoice line in range. */
  totalRevenue: number
  lineCount: number
  invoiceCount: number
  categoryTotals: {
    category: ReportCategory
    label: string
    total: number
    /** Percentage of totalRevenue, 0-100, one decimal. */
    share: number
  }[]
  /** One entry per month in range; revenue split by category. */
  monthly: (MonthPoint & {
    total: number
    byCategory: Record<ReportCategory, number>
  })[]
}

export type ExpenseAnalysisData = {
  totalExpenses: number
  transactionCount: number
  /** Average per calendar month in range, including months with no spend. */
  averagePerMonth: number
  topCategory: {
    category: ReportExpenseCategory
    label: string
    total: number
    share: number
  } | null
  categoryTotals: {
    category: ReportExpenseCategory
    label: string
    total: number
    share: number
  }[]
  monthly: (MonthPoint & {
    total: number
    byCategory: Record<ReportExpenseCategory, number>
  })[]
}

export type PayrollPayeeRow = {
  payeeType: ReportPayeeType
  payeeId: string
  payeeName: string
  /** Current active contract amount. Point-in-time, not period-scoped. */
  contracted: number | null
  invoiced: number
  paid: number
  due: number
}

export type PayrollSummaryData = {
  /** Sum over the range, non-void payroll invoices. */
  totalInvoiced: number
  totalPaid: number
  totalDue: number
  invoiceCount: number
  payeeCount: number
  /**
   * Monthly run-rate from currently open contracts, split by payee type.
   * Point-in-time figure, deliberately kept separate from the range-scoped
   * totals above so the two are never summed together.
   */
  activeRunRate: {
    staff: number
    teacher: number
    total: number
    staffCount: number
    teacherCount: number
  }
  byType: {
    payeeType: ReportPayeeType
    label: string
    invoiced: number
    paid: number
    due: number
  }[]
  monthly: (MonthPoint & {
    invoiced: number
    paid: number
    due: number
    staffInvoiced: number
    teacherInvoiced: number
  })[]
  payees: PayrollPayeeRow[]
}

export type ReportsData = {
  range: { fromYear: number; fromMonth: number; toYear: number; toMonth: number }
  revenue: RevenueByCategoryData
  expenses: ExpenseAnalysisData
  payroll: PayrollSummaryData
  profitLoss: import("@/types/profit-loss-types").ProfitLossData
}
