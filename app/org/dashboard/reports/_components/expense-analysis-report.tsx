import { formatRupee, money } from "@/app/org/dashboard/lib/utils"
import { Banknote, CalendarRange, ListChecks, TrendingUp } from "lucide-react"

import { SummaryBox } from "../../invoices/_components/utils"
import type { ExpenseAnalysisData } from "@/types/report-types"

import { ExpenseMonthlyChart } from "./report-charts"
import { EXPENSE_CATEGORY_COLORS } from "./report-chart-config"
import { ReportCard, ReportEmpty, ShareBars } from "./report-primitives"

export default function ExpenseAnalysisReport({
  data,
}: {
  data: ExpenseAnalysisData
}) {
  return (
    <div className="w-full flex-col space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryBox
          label="Total expenses"
          value={formatRupee(money(data.totalExpenses))}
          icon={Banknote}
          theme="due"
        />
        <SummaryBox
          label="Average / month"
          value={formatRupee(money(data.averagePerMonth))}
          icon={TrendingUp}
          theme="billed"
        />
        <SummaryBox
          label="Transactions"
          value={String(data.transactionCount)}
          icon={ListChecks}
          theme="overdue"
        />
        <SummaryBox
          label="Top category"
          value={data.topCategory ? data.topCategory.label : "—"}
          icon={CalendarRange}
          theme="paid"
        />
      </div>

      {data.totalExpenses === 0 ? (
        <ReportCard title="Expense analysis">
          <ReportEmpty message="No expenses recorded in this range" />
        </ReportCard>
      ) : (
        <>
          <ReportCard
            title="Expenses by category"
            description="Share of total spend across the selected range."
          >
            <ShareBars
              items={data.categoryTotals.map((item) => ({
                label: item.label,
                total: item.total,
                share: item.share,
                color: EXPENSE_CATEGORY_COLORS[item.category],
              }))}
            />
          </ReportCard>

          <ReportCard
            title="Expenses by month"
            description="Stacked by category. Months with no spend appear as zero."
          >
            <ExpenseMonthlyChart data={data} />
          </ReportCard>
        </>
      )}
    </div>
  )
}
