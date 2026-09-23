"use client"

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  InvoiceLineItemRow,
  InvoiceRow,
  InvoiceSummary,
  StudentRow,
} from "@/types/invoice-type"
import {
  AlertCircleIcon,
  ArrowLeft,
  CircleCheckIcon,
  ClockAlert,
  Download,
  EyeIcon,
  ReceiptIcon,
} from "lucide-react"
import Link from "next/link"

import React, { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { SummaryBox } from "./utils"
import {
  formatDateYearMonth,
  formatRupee,
  formatStatus,
  formatYearMonth,
} from "../../lib/utils"

export default function InvoiceList({
  student,
  invoices,
  summary,
}: {
  student: StudentRow
  invoices: InvoiceRow[]
  summary: InvoiceSummary
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-2">
      {/* Back + student header */}
      <Button variant="outline" asChild>
        <Link href={`/org/dashboard/students/${student.id}`}>
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={`/${student.profileImage ?? ""}`} />
              <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{student.fullName}</CardTitle>
              <CardDescription>Invoice history</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryBox
              theme="billed"
              icon={ReceiptIcon}
              label="Total billed"
              value={formatRupee(summary.totalBilled)}
            />
            <SummaryBox
              theme="paid"
              icon={CircleCheckIcon}
              label="Total paid"
              value={formatRupee(summary.totalPaid)}
            />
            <SummaryBox
              theme="due"
              icon={AlertCircleIcon}
              label="Total due"
              value={formatRupee(summary.totalDue)}
            />
            <SummaryBox
              theme="overdue"
              icon={ClockAlert}
              label="Overdue invoices"
              value={summary.overDueCount.toString()}
            />
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="">
                <TableCell className="py-2!">
                  {formatYearMonth(invoice.periodYear, invoice.periodMonth)}
                </TableCell>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatStatus(invoice.status)}</TableCell>
                <TableCell className="font-semibold text-gray-500">
                  {formatRupee(invoice.total)}
                </TableCell>
                <TableCell className="font-semibold text-green-500">
                  {formatRupee(invoice.paidAmount)}
                </TableCell>
                <TableCell className="font-semibold text-red-500">
                  {formatRupee(invoice.dueAmount)}
                </TableCell>
                <TableCell>
                  {formatDateYearMonth(new Date(invoice.dueDate))}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <InvoiceItems invoice={invoice} />
                  <Button variant="outline" size="icon">
                    <Download />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No invoices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationControls totalPages={summary.totalPages} />
    </div>
  )
}

function InvoiceItems({ invoice }: { invoice: InvoiceRow }) {
  const [open, setOpen] = useState(false)
  const { lineItems } = invoice
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="icon">
            <EyeIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:min-w-lg">
          {/* Bill paper */}
          <div className="bg-background">
            {/* Header */}
            <div className="border-b bg-muted/30 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Invoice
                  </p>
                  <DialogTitle className="mt-1 text-xl font-bold">
                    {invoice.invoiceNumber}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {formatYearMonth(invoice.periodYear, invoice.periodMonth)}
                  </DialogDescription>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2 text-right text-xs">
                  <p className="text-muted-foreground">Due date</p>
                  <p className="font-semibold">
                    {formatDateYearMonth(new Date(invoice.dueDate))}
                  </p>
                </div>
              </div>
            </div>
            {/* Line items — bill body */}
            <div className="px-6 py-4">
              <div className="mb-3 grid grid-cols-[1fr_auto] gap-2 border-b pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <span>Description</span>
                <span className="text-right">Amount</span>
              </div>
              {lineItems.length > 0 ? (
                <ul className="divide-y">
                  {lineItems.map((item: InvoiceLineItemRow) => (
                    <li
                      key={item.id}
                      className="grid grid-cols-[1fr_auto] gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {item.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        {item.chargeStartAt && item.chargeEndAt ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.chargeStartAt} → {item.chargeEndAt}
                            {item.isProrated
                              ? ` · ${item.daysCharged}/${item.daysInMonth} days`
                              : null}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatRupee(item.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No line items on this invoice.
                </p>
              )}
            </div>
            {/* Totals — bill footer */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatRupee(invoice.subTotal)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatRupee(invoice.total)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Paid</span>
                  <span className="tabular-nums">
                    {formatRupee(invoice.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold text-destructive">
                  <span>Balance due</span>
                  <span className="tabular-nums">
                    {formatRupee(invoice.dueAmount)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Status: {invoice.status}</span>
                <span>
                  Issued {formatDateYearMonth(new Date(invoice.issuedAt))}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
