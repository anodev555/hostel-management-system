import { formatRupee, money } from "@/app/org/dashboard/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Banknote, GraduationCap, Receipt, UserCheck } from "lucide-react"

import { SummaryBox } from "../../invoices/_components/utils"
import type { PayrollSummaryData } from "@/types/report-types"

import { PayrollMonthlyChart, PayrollSplitChart } from "./report-charts"
import { PAYEE_COLORS } from "./report-chart-config"
import { ReportCard, ReportEmpty } from "./report-primitives"

export default function PayrollSummaryReport({
  data,
}: {
  data: PayrollSummaryData
}) {
  const hasActivity =
    data.totalInvoiced > 0 || data.payeeCount > 0 || data.activeRunRate.total > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryBox
          label="Payroll invoiced"
          value={formatRupee(money(data.totalInvoiced))}
          icon={Receipt}
          theme="billed"
        />
        <SummaryBox
          label="Payroll paid"
          value={formatRupee(money(data.totalPaid))}
          icon={Banknote}
          theme="paid"
        />
        <SummaryBox
          label="Outstanding"
          value={formatRupee(money(data.totalDue))}
          icon={Banknote}
          theme="due"
        />
        <SummaryBox
          label="Current run-rate"
          value={formatRupee(money(data.activeRunRate.total))}
          icon={UserCheck}
          theme="overdue"
        />
      </div>

      {!hasActivity ? (
        <ReportCard title="Payroll summary">
          <ReportEmpty message="No payroll contracts or invoices in this range" />
        </ReportCard>
      ) : (
        <>
          <ReportCard
            title="Staff vs teachers"
            description="Invoiced, paid and outstanding for the selected range."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {data.byType.map((item) => (
                <div
                  key={item.payeeType}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: PAYEE_COLORS[item.payeeType] }}
                    />
                    <p className="font-medium">{item.label}</p>
                    {item.payeeType === "teacher" ? (
                      <GraduationCap className="size-4 text-muted-foreground" />
                    ) : (
                      <UserCheck className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Invoiced</dt>
                      <dd className="font-medium">
                        {formatRupee(money(item.invoiced))}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Paid</dt>
                      <dd className="font-medium text-emerald-600">
                        {formatRupee(money(item.paid))}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Outstanding</dt>
                      <dd className="font-medium text-destructive">
                        {formatRupee(money(item.due))}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Current run-rate is the monthly total of contracts open today (
              {data.activeRunRate.staffCount} staff,{" "}
              {data.activeRunRate.teacherCount} teachers). It is a
              point-in-time figure and is not part of the range totals above.
            </p>
          </ReportCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <ReportCard
              title="Payroll by month"
              description="Invoiced, paid and outstanding per month."
            >
              <PayrollMonthlyChart data={data} />
            </ReportCard>

            <ReportCard
              title="Cost by payee type"
              description="Which side of the payroll drives the month."
            >
              <PayrollSplitChart data={data} />
            </ReportCard>
          </div>

          <ReportCard
            title="Payees"
            description="Everyone with an open contract or activity in this range, largest outstanding first."
          >
            {data.payees.length === 0 ? (
              <ReportEmpty message="No payees in this range" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Contract / month</TableHead>
                    <TableHead className="text-right">Invoiced</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payees.map((payee) => (
                    <TableRow key={`${payee.payeeType}:${payee.payeeId}`}>
                      <TableCell className="font-medium">
                        {payee.payeeName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payee.payeeType === "staff" ? "Staff" : "Teacher"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payee.contracted === null
                          ? "—"
                          : formatRupee(money(payee.contracted))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupee(money(payee.invoiced))}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {formatRupee(money(payee.paid))}
                      </TableCell>
                      <TableCell className="text-right">
                        {payee.due > 0 ? (
                          <span className="font-medium text-destructive">
                            {formatRupee(money(payee.due))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ReportCard>
        </>
      )}
    </div>
  )
}
