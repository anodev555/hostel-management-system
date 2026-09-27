"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  PayrollEmployeeDetail,
  PayrollEmployeeInvoiceRow,
} from "@/types/payroll-types";

import {
  AlertCircleIcon,
  ArrowLeft,
  Banknote,
  CircleCheckIcon,
  Mail,
  MinusCircle,
  Phone,
  ReceiptIcon,
} from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import {
  formatDateYearMonth,
  formatPaymentMethod,
  formatRupee,
  formatYearMonth,
} from "../../../../../lib/utils";
import { SummaryBox } from "../../../../../invoices/_components/utils";
import PayEmployeeForm from "./pay-employee-form";
import PayoutLogActions from "./payout-log-actions";
import { InvoiceTable } from "./sharedinvoice-table";
import { PermissionGate } from "@/lib/permissions/permission-gate";

const DEDUCTION_REASON_STYLES: Record<string, string> = {
  advance: "bg-indigo-500 text-white",
  loan: "bg-warning text-warning-foreground",
  fine: "bg-destructive text-white",
  other: "bg-muted text-muted-foreground",
};

export default function EmployeeDetail({
  data,
}: {
  data: PayrollEmployeeDetail;
}) {
  const { payee, summary, outstanding, completed, payouts } = data;
  const remaining = Number(summary.totalRemaining);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Button variant="outline" asChild>
        <Link href="/org/dashboard/payroll">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      {/* Header — total currently need to pay */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarImage src={payee.image ? `/${payee.image}` : undefined} />
              <AvatarFallback>
                {payee.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="mt-1 text-2xl">{payee.name}</CardTitle>
              <CardDescription className="mt-1 ">
                {payee.role ?? data.payeeType}
                {payee.phone ? ` · ${payee.phone}` : ""}
                {payee.email ? ` · ${payee.email}` : ""}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate resource="payroll" action="pay">
              {remaining > 0 ? (
                <PayEmployeeForm
                  payeeType={data.payeeType}
                  payeeId={payee.id}
                  payeeName={payee.name}
                  remainingAmount={summary.totalRemaining}
                />
              ) : (
                <Badge className="bg-green-500 text-white">
                  All dues cleared
                </Badge>
              )}
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryBox
              theme="due"
              icon={AlertCircleIcon}
              label="Total need to pay now"
              value={formatRupee(summary.totalRemaining)}
            />
            <SummaryBox
              theme="billed"
              icon={ReceiptIcon}
              label="Gross (outstanding)"
              value={formatRupee(summary.totalGross)}
            />
            <SummaryBox
              theme="overdue"
              icon={MinusCircle}
              label="Deductions"
              value={formatRupee(summary.totalDeductions)}
            />
            <SummaryBox
              theme="billed"
              icon={Banknote}
              label="Net (outstanding)"
              value={formatRupee(summary.totalNet)}
            />
            <SummaryBox
              theme="paid"
              icon={CircleCheckIcon}
              label="Paid (on outstanding)"
              value={formatRupee(summary.totalPaid)}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3.5" />
              {payee.phone ?? "No phone"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="size-3.5" />
              {payee.email ?? "No email"}
            </span>
            <span>
              Active contract:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {payee.activeContractAmount
                  ? formatRupee(payee.activeContractAmount)
                  : "—"}
              </span>
            </span>
            <span>
              {summary.outstandingCount} outstanding · {summary.paidCount}{" "}
              completed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: outstanding / completed / payout logs */}
      <Tabs defaultValue="outstanding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outstanding">
            Outstanding ({outstanding.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Payout logs ({payouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Outstanding invoices — unpaid + partial
              </CardTitle>
              <CardDescription>
                Deductions can only be added here. Payments always clear the
                oldest invoices first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable
                rows={outstanding}
                emptyMessage="No outstanding dues. All invoices are cleared."
                showDeductionActions
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Completed payouts — paid invoices
              </CardTitle>
              <CardDescription>
                Fully paid invoices. Deductions are locked once an invoice is
                completed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable
                rows={completed}
                emptyMessage="No completed payouts yet."
                showDeductionActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Salary payout log</CardTitle>
              <CardDescription>
                Every payout recorded for {payee.name}, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Date</th>
                        <th className="py-2 pr-4 font-medium">Invoice</th>
                        <th className="py-2 pr-4 text-right font-medium">
                          Amount
                        </th>
                        <th className="py-2 pr-4 font-medium">Method</th>
                        <th className="py-2 pr-4 font-medium">Reference</th>
                        <th className="py-2 pr-4 font-medium">Paid by</th>
                        <th className="py-2 pr-4 font-medium">Notes</th>
                        <PermissionGate resource="payroll" action="update">
                          <th className="py-2 text-right font-medium">
                            Actions
                          </th>
                        </PermissionGate>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b">
                          <td className="py-2.5 pr-4">
                            {formatDateYearMonth(new Date(payout.paidAt))}
                          </td>
                          <td className="py-2.5 pr-4">
                            <p className="font-mono text-xs">
                              {payout.invoiceNumber}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {payout.periodYear > 0
                                ? formatYearMonth(
                                    payout.periodYear,
                                    payout.periodMonth,
                                  )
                                : "—"}
                            </p>
                          </td>
                          <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatRupee(payout.amount)}
                          </td>
                          <td className="py-2.5 pr-4">
                            {formatPaymentMethod(payout.method)}
                          </td>
                          <td className="py-2.5 pr-4">
                            {payout.reference ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            {payout.collectedByName ?? payout.receivedBy ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {payout.notes ?? "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            <PayoutLogActions payout={payout} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No payouts recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
