"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { money } from "@/app/org/dashboard/lib/utils"
import type { ProfitLossData } from "@/types/profit-loss-types"

const AXIS_STYLE = { fontSize: 12, fill: "#71717a" } as const

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  fontSize: "12px",
} as const

const COLORS = {
  collected: "#10b981",
  payrollPaid: "#f59e0b",
  operationsSpent: "#a1a1aa",
} as const

function formatAxisMoney(value: number) {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`
  return String(value)
}

function rupees(value: number) {
  return `Rs. ${money(value)}`
}

/** Cash in against cash out, month by month. */
export default function ProfitLossChart({ data }: { data: ProfitLossData }) {
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
            fill={COLORS.collected}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="payrollPaid"
            name="Paid to staff & teachers"
            fill={COLORS.payrollPaid}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="operationsSpent"
            name="Operational spend"
            fill={COLORS.operationsSpent}
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
