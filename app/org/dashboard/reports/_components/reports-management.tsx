"use client"

import { BarChart3 } from "lucide-react"

import { formatYearMonth } from "@/app/org/dashboard/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReportsData } from "@/types/report-types"

import ExpenseAnalysisReport from "./expense-analysis-report"
import PayrollSummaryReport from "./payroll-summary-report"
import ProfitLossReport from "./profit-loss-report"
import ReportFilter from "./report-filter"
import RevenueByCategoryReport from "./revenue-by-category-report"

export default function ReportsManagement({ data }: { data: ReportsData }) {
  const { range } = data
  const rangeLabel = `${formatYearMonth(range.fromYear, range.fromMonth)} – ${formatYearMonth(range.toYear, range.toMonth)}`

  return (
    <div className="w-full flex-col space-y-4">
      {/* header section */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Revenue, expense and payroll analysis for your organisation.
          </p>
        </div>
        <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
          {rangeLabel}
        </p>
      </div>

      <ReportFilter
        fromYear={range.fromYear}
        fromMonth={range.fromMonth}
        toYear={range.toYear}
        toMonth={range.toMonth}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="revenue">Revenue by category</TabsTrigger>
          <TabsTrigger value="expenses">Expense analysis</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="profitLoss">Profit &amp; loss</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <RevenueByCategoryReport data={data.revenue} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ExpenseAnalysisReport data={data.expenses} />
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <PayrollSummaryReport data={data.payroll} />
        </TabsContent>

        <TabsContent value="profitLoss" className="mt-4">
          <ProfitLossReport data={data.profitLoss} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
