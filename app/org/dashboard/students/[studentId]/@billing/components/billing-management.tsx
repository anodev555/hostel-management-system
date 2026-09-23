"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { billRowsType } from "@/types/billing-type"
import {
  AlertCircleIcon,
  CircleCheckIcon,
  ClockAlert,
  ExternalLink,
  ReceiptIcon,
} from "lucide-react"
import CollectPayment from "./collectpayment-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  formatRupee,
  formatStatus,
  formatYearMonth,
} from "@/app/org/dashboard/lib/utils"
import { PermissionGate } from "@/lib/permissions/permission-gate"

const summaryThemes = {
  billed: {
    card: "border-primary/20 bg-primary/8",
    icon: "bg-primary text-primary-foreground shadow-lg shadow-primary/35",
    value: "text-foreground",
  },
  paid: {
    card: "border-emerald-500/25 bg-emerald-500/10",
    icon: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/35",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  overdue: {
    card: "border-destructive/25 bg-destructive/8",
    icon: "bg-destructive text-white shadow-lg shadow-destructive/35",
    value: "text-destructive",
  },
  overdueCount: {
    card: "border-warning/25 bg-warning/8",
    icon: "bg-warning text-warning-foreground shadow-lg shadow-warning/35",
    value: "text-warning",
  },
} as const
function SummaryBox({
  label,
  value,
  icon: Icon,
  theme,
}: {
  label: string
  value: string

  icon: React.ComponentType<{ className?: string }>
  theme: keyof typeof summaryThemes
}) {
  const styles = summaryThemes[theme]
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border px-4 py-4",
        styles.card
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            styles.icon
          )}
        >
          <Icon className="size-4" />
        </div>
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>
        {value}
      </p>
    </div>
  )
}
export default function BillingManagement({
  studentId,
  bills,
}: {
  bills: billRowsType[]
  studentId: string
}) {
  const totalBillAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.total),
    0
  )
  const totalPaidAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.paidAmount),
    0
  )
  const totalDueAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.dueAmount),
    0
  )
  const overDueCount = bills.filter((bill) => bill.isOverDue)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Billing</CardTitle>
            <CardDescription>
              Unpaid and partially paid invoices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGate resource="invoice" action="read">
              <Link href={`/org/dashboard/invoices?studentId=${studentId}`}>
                <Button variant="outline">
                  View All <ExternalLink />
                </Button>
              </Link>
            </PermissionGate>
            <PermissionGate resource="student" action="collectpayment">
              <CollectPayment studentId={studentId} />
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryBox
              theme="billed"
              icon={ReceiptIcon}
              label="Total Bill"
              value={formatRupee(totalBillAmount)}
            />
            <SummaryBox
              theme="paid"
              icon={CircleCheckIcon}
              label="Total Paid"
              value={formatRupee(totalPaidAmount)}
            />
            <SummaryBox
              theme="overdue"
              icon={AlertCircleIcon}
              label="Total Due"
              value={formatRupee(totalDueAmount)}
            />

            <SummaryBox
              theme="overdueCount"
              icon={ClockAlert}
              label="Overdue count"
              value={overDueCount.length.toString()}
            />
          </div>
        </CardContent>
      </Card>
      <Table className="overflow-x-auto">
        <TableHeader className="bg-muted-background">
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  {formatYearMonth(bill.periodYear, bill.periodMonth)}
                </TableCell>
                <TableCell>{formatStatus(bill.status)}</TableCell>
                <TableCell className="font-bold text-gray-500">
                  {formatRupee(bill.total)}
                </TableCell>
                <TableCell className="font-bold text-green-500">
                  {formatRupee(bill.paidAmount)}
                </TableCell>
                <TableCell className="font-bold text-red-500">
                  {formatRupee(bill.dueAmount)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No bills Available. All Bills are Paid!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
