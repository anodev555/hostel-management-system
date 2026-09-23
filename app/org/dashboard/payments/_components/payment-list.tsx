"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Banknote,
  CircleCheckIcon,
  ClockAlert,
  ReceiptIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { PaginationControls } from "@/components/pagination-controls"
import type {
  PaymentHistoryRow,
  PaymentStudentRow,
  PaymentSummary,
} from "@/types/payment-type"
import {
  formatLate,
  formatMethod,
  formatPaidAt,
  formatRupee,
  SummaryBox,
} from "./utils"
import { formatPaymentMethod, formatYearMonth } from "../../lib/utils"
import EditPaymentForm from "./editpayment-form"
import { PermissionGate } from "@/lib/permissions/permission-gate"

export default function PaymentList({
  student,
  payments,
  summary,
}: {
  student: PaymentStudentRow
  payments: PaymentHistoryRow[]
  summary: PaymentSummary
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Button variant="outline" asChild>
        <Link href={`/org/dashboard/students/${student.id}`}>
          <ArrowLeft className="size-4" />
          Back to student
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={`/${student.profileImage ?? ""}`} />
            <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{student.fullName}</CardTitle>
            <CardDescription>Payment history</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <SummaryBox
              theme="collected"
              icon={Banknote}
              label="Total collected"
              value={formatRupee(summary.totalCollected)}
            />
            <SummaryBox
              theme="count"
              icon={CircleCheckIcon}
              label="Payments"
              value={summary.paymentCount.toString()}
            />
            <SummaryBox
              theme="late"
              icon={ClockAlert}
              label="Late payments"
              value={summary.latePaymentCount.toString()}
            />
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Received by</TableHead>
            <TableHead>Collected by</TableHead>
            <TableHead>Status</TableHead>
            <PermissionGate resource="payment" action="edit">
     
              <TableHead>Actions</TableHead>
            </PermissionGate>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length > 0 ? (
            payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground">
                  {formatPaidAt(p.paidAt)}
                </TableCell>
                <TableCell className="font-medium">{p.invoiceNumber}</TableCell>
                <TableCell>
                  {formatYearMonth(p.periodYear, p.periodMonth)}
                </TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatRupee(p.amount)}
                </TableCell>
                <TableCell>{formatPaymentMethod(p.method)}</TableCell>
                <TableCell>{p.reference ?? "—"}</TableCell>
                <TableCell>{p.receivedBy ?? "—"}</TableCell>
                <TableCell>{p.collectedByName ?? "—"}</TableCell>
                <TableCell>{formatLate(p.isLate)}</TableCell>
                <PermissionGate resource="payment" action="edit">
                  <TableCell>
                    <EditPaymentForm payment={p} student={student.id} />
                  </TableCell>
                </PermissionGate>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-12 text-center text-muted-foreground"
              >
                No payments recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControls totalPages={summary.totalPages} />
    </div>
  )
}
