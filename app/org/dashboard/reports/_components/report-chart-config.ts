import type {
  ReportCategory,
  ReportExpenseCategory,
  ReportPayeeType,
} from "@/types/report-types"

/**
 * Fixed hex (not Tailwind class) values, because Recharts needs a real colour
 * for SVG fills and cannot resolve `var(--foo)` reliably inside its scale
 * domain. Kept in one place so every chart shares one palette.
 */
export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  tuition: "#6366f1",
  lodging: "#0ea5e9",
  food: "#10b981",
  fine: "#f59e0b",
}

export const EXPENSE_CATEGORY_COLORS: Record<ReportExpenseCategory, string> = {
  rent: "#ef4444",
  utilities: "#f59e0b",
  maintenance: "#6366f1",
  fuel: "#0ea5e9",
  food: "#10b981",
  other: "#a1a1aa",
}

export const PAYEE_COLORS: Record<ReportPayeeType, string> = {
  staff: "#6366f1",
  teacher: "#0ea5e9",
}

export const CHART_COLORS = {
  invoiced: "#6366f1",
  paid: "#10b981",
  due: "#ef4444",
  total: "#6366f1",
} as const

/** Cash-in / cash-out series for the profit & loss monthly chart. */
export const CASH_FLOW_COLORS = {
  collected: "#10b981",
  payrollPaid: "#f59e0b",
  operationsSpent: "#a1a1aa",
} as const

export const AXIS_STYLE = { fontSize: 12, fill: "#71717a" } as const
