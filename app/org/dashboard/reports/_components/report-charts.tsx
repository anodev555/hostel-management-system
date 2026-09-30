"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { money } from "@/app/org/dashboard/lib/utils"
import type { ProfitLossData } from "@/types/profit-loss-types"
import type {
  ExpenseAnalysisData,
  PayrollSummaryData,
  RevenueByCategoryData,
} from "@/types/report-types"

import {
  AXIS_STYLE,
  CASH_FLOW_COLORS,
  CATEGORY_COLORS,
  CHART_COLORS,
  EXPENSE_CATEGORY_COLORS,
  PAYEE_COLORS,
} from "./report-chart-config"

function formatAxisMoney(value: number) {
  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 1000)}k`
  }
  return String(value)
}

function rupees(value: number) {
  return `Rs. ${money(value)}`
}

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  fontSize: "12px",
} as const

/** Stacked month-by-month revenue, one stack per charge category. */
export function RevenueMonthlyChart({ data }: { data: RevenueByCategoryData }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisMoney}
          width={56}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => rupees(Number(value))}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {data.categoryTotals.map((item) => (
          <Bar
            key={item.category}
            dataKey={`byCategory.${item.category}`}
            name={item.label}
            stackId="revenue"
            fill={CATEGORY_COLORS[item.category]}
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Revenue trend as a single total line, to read the shape over time. */
export function RevenueTrendChart({ data }: { data: RevenueByCategoryData }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisMoney}
          width={56}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => rupees(Number(value))}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Revenue"
          stroke={CHART_COLORS.total}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Expenses stacked by category per month. */
export function ExpenseMonthlyChart({ data }: { data: ExpenseAnalysisData }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisMoney}
          width={56}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => rupees(Number(value))}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {data.categoryTotals.map((item) => (
          <Bar
            key={item.category}
            dataKey={`byCategory.${item.category}`}
            name={item.label}
            stackId="expense"
            fill={EXPENSE_CATEGORY_COLORS[item.category]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Invoiced vs paid vs due per month, plus the staff/teacher split. */
export function PayrollMonthlyChart({ data }: { data: PayrollSummaryData }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisMoney}
          width={56}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => rupees(Number(value))}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="invoiced" name="Invoiced" fill={CHART_COLORS.invoiced} radius={[4, 4, 0, 0]} />
        <Bar dataKey="paid" name="Paid" fill={CHART_COLORS.paid} radius={[4, 4, 0, 0]} />
        <Bar dataKey="due" name="Outstanding" fill={CHART_COLORS.due} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Which payee type drives the cost, per month. */
export function PayrollSplitChart({ data }: { data: PayrollSummaryData }) {
  const rows = data.monthly.map((point) => ({
    label: point.label,
    staff: point.staffInvoiced,
    teacher: point.teacherInvoiced,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisMoney}
          width={56}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => rupees(Number(value))}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="staff" name="Staff" stackId="payee" fill={PAYEE_COLORS.staff} />
        <Bar
          dataKey="teacher"
          name="Teacher"
          stackId="payee"
          fill={PAYEE_COLORS.teacher}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Cash in against cash out, month by month. */
export function ProfitLossChart({ data }: { data: ProfitLossData }) {
  const hasAnyCash = data.monthly.some(
    (point) =>
      point.collected > 0 || point.payrollPaid > 0 || point.operationsSpent > 0
  )

  if (!hasAnyCash) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No money moved in this range
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.monthly}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAxisMoney}
            width={56}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => rupees(Number(value))}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="collected"
            name="Collected from students"
            fill={CASH_FLOW_COLORS.collected}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="payrollPaid"
            name="Paid to staff & teachers"
            fill={CASH_FLOW_COLORS.payrollPaid}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="operationsSpent"
            name="Operational spend"
            fill={CASH_FLOW_COLORS.operationsSpent}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground">
        Each bar is the month the cash actually moved, not the month it was
        billed. A month can show collections for an earlier bill, which is why
        a single month rarely looks balanced.
      </p>
    </div>
  )
}
