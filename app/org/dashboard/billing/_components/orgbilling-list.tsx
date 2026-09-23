"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ClockAlert,
  EyeIcon,
  ReceiptIndianRupee,
  Users,
} from "lucide-react"

import { PaginationControls } from "@/components/pagination-controls"
import { SearchBar } from "@/components/search-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  OrgBillingOpenInvoice,
  OrgBillingStudentRow,
  OrgBillingSummary,
} from "@/types/billing-type"

import {
  formatDateYearMonth,
  formatRupee,
  formatStatus,
  formatYearMonth,
} from "../../lib/utils"
import { SummaryBox } from "./utils"

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

function profileSrc(path: string | null) {
  if (!path) return undefined
  return `/${path}`
}

function formatDueDate(value: string) {
  const dateOnly = value.slice(0, 10)
  const [year, month, day] = dateOnly.split("-").map(Number)
  if (!year || !month || !day) return dateOnly
  return formatDateYearMonth(new Date(year, month - 1, day))
}

export default function OrgBillingList({
  summary,
  students,
  totalPages,
}: {
  summary: OrgBillingSummary
  students: OrgBillingStudentRow[]
  totalPages: number
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = searchParams.get("search")
  const emptyMessage = search
    ? "No students match this search."
    : "No outstanding balances. All invoices are paid."

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Students with unpaid invoices. Click a row to collect payment, or view
          bills to see each month.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryBox
          label="Total outstanding"
          value={formatRupee(summary.totalOutstanding)}
          theme="totalOutstanding"
          icon={ReceiptIndianRupee}
        />
        <SummaryBox
          label="Total overdue"
          value={formatRupee(summary.overdueTotal)}
          theme="totalOverdue"
          icon={AlertTriangle}
        />
        <SummaryBox
          label="Students with due"
          value={summary.studentsWithDue.toString()}
          theme="studentsWithDue"
          icon={Users}
        />
        <SummaryBox
          label="Overdue invoices"
          value={summary.overdueInvoiceCount.toString()}
          theme="overdueCount"
          icon={ClockAlert}
        />
      </div>

      <div className="flex flex-col gap-3">
        <SearchBar
          className="max-w-md"
          param="search"
          placeholder="Search by student name"
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Open months</TableHead>
              <TableHead>Total due</TableHead>
              <TableHead>Overdue</TableHead>
              <TableHead>Oldest due date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow
                  key={student.studentId}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/org/dashboard/students/${student.studentId}`)
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar size="lg">
                        <AvatarImage
                          src={profileSrc(student.studentProfile)}
                          alt={student.fullName}
                        />
                        <AvatarFallback>
                          {initials(student.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.openInvoiceCount} open{" "}
                          {student.openInvoiceCount === 1
                            ? "invoice"
                            : "invoices"}
                          {student.overdueInvoiceCount > 0
                            ? ` · ${student.overdueInvoiceCount} overdue`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <OpenMonthBadges invoices={student.openInvoices} />
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {formatRupee(student.totalDue)}
                  </TableCell>
                  <TableCell className="font-semibold text-destructive tabular-nums">
                    {Number(student.overDue) > 0
                      ? formatRupee(student.overDue)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.oldestDueDate
                      ? formatDueDate(student.oldestDueDate)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center justify-end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <StudentBillsDialog student={student} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <PaginationControls totalPages={totalPages} />
      </div>
    </div>
  )
}

function OpenMonthBadges({ invoices }: { invoices: OrgBillingOpenInvoice[] }) {
  if (invoices.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const shown = invoices.slice(0, 2)
  const extra = invoices.length - shown.length

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((invoice) => (
        <Badge
          key={invoice.invoiceId}
          variant={invoice.isOverDue ? "destructive" : "outline"}
        >
          {formatYearMonth(invoice.periodYear, invoice.periodMonth)}
        </Badge>
      ))}
      {extra > 0 ? <Badge variant="secondary">+{extra} more</Badge> : null}
    </div>
  )
}

function StudentBillsDialog({ student }: { student: OrgBillingStudentRow }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <EyeIcon data-icon="inline-start" />
          View bills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl sm:min-w-4xl">
        <DialogHeader>
          <DialogTitle>{student.fullName}</DialogTitle>
          <DialogDescription>
            Open invoices. Total due {formatRupee(student.totalDue)}.
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {student.openInvoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-16 text-center text-muted-foreground"
                >
                  No open invoices for this student.
                </TableCell>
              </TableRow>
            ) : (
              student.openInvoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell>
                    {formatYearMonth(invoice.periodYear, invoice.periodMonth)}
                  </TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatStatus(invoice.status)}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatRupee(invoice.total)}
                  </TableCell>
                  <TableCell className="text-emerald-600 tabular-nums dark:text-emerald-400">
                    {formatRupee(invoice.paidAmount)}
                  </TableCell>
                  <TableCell className="font-semibold text-destructive tabular-nums">
                    {formatRupee(invoice.dueAmount)}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {formatDueDate(invoice.dueDate)}
                    </span>
                    {invoice.isOverDue ? (
                      <Badge variant="destructive" className="ml-2">
                        Overdue
                      </Badge>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
