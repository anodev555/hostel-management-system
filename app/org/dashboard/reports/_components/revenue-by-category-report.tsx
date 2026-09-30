import { formatRupee, money } from "@/app/org/dashboard/lib/utils"
import { Receipt, Wallet } from "lucide-react"

import { SummaryBox } from "../../invoices/_components/utils"
import type { RevenueByCategoryData } from "@/types/report-types"

import { RevenueMonthlyChart, RevenueTrendChart } from "./report-charts"
import { CATEGORY_COLORS } from "./report-chart-config"
import { ReportCard, ReportEmpty, ShareBars } from "./report-primitives"

export default function RevenueByCategoryReport({
  data,
}: {
  data: RevenueByCategoryData
}) {
  const top = data.categoryTotals
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)[0]

  return (
    <div className="w-full flex-col space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryBox
          label="Total revenue"
          value={formatRupee(money(data.totalRevenue))}
          icon={Wallet}
          theme="billed"
        />
        <SummaryBox
          label="Invoices"
          value={String(data.invoiceCount)}
          icon={Receipt}
          theme="paid"
        />
        <SummaryBox
          label="Line items"
          value={String(data.lineCount)}
          icon={Receipt}
          theme="due"
        />
        <SummaryBox
          label="Top category"
          value={top ? top.label : "—"}
          icon={Receipt}
          theme="overdue"
        />
      </div>

      {data.totalRevenue === 0 ? (
        <ReportCard title="Revenue by category">
          <ReportEmpty message="No non-void invoice lines in this range" />
        </ReportCard>
      ) : (
        <>
          <ReportCard
            title="Revenue by category"
            description="Charges grouped by the line-item category on each invoice."
          >
            <ShareBars
              items={data.categoryTotals.map((item) => ({
                label: item.label,
                total: item.total,
                share: item.share,
                color: CATEGORY_COLORS[item.category],
              }))}
            />
          </ReportCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <ReportCard
              title="Revenue by month"
              description="Stacked by charge category."
            >
              <RevenueMonthlyChart data={data} />
            </ReportCard>

            <ReportCard
              title="Revenue trend"
              description="Total billed per month."
            >
              <RevenueTrendChart data={data} />
            </ReportCard>
          </div>
        </>
      )}
    </div>
  )
}
