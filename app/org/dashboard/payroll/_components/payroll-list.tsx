"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginationControls } from "@/components/pagination-controls"
import { PayrollEmployeeRow, PayrollSummary } from "@/types/payroll-types"
import { cn } from "@/lib/utils"
import {
  AlertCircleIcon,
  ArrowRight,
  CircleCheckIcon,
  ClockAlert,
  ReceiptIcon,
  Search,
  X,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCallback, useState } from "react"
import { formatRupee, formatStatus } from "../../lib/utils"
import { SummaryBox } from "../../invoices/_components/utils"

export default function PayrollList({
  summary,
  employees,
}: {
  summary: PayrollSummary
  employees: PayrollEmployeeRow[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  const applySearch = useCallback(
    (value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      // Keep only search + pagination params; drop legacy filter params
      params.delete("payeeType")
      params.delete("status")
      if (value === undefined || value === "") {
        params.delete("search")
      } else {
        params.set("search", value)
      }
      params.delete("page")
      const query = params.toString()
      router.push(query ? `/org/dashboard/payroll?${query}` : "/org/dashboard/payroll")
    },
    [router, searchParams]
  )

  function handleSearchSubmit() {
    applySearch(search.trim() || undefined)
  }

  function clearSearch() {
    setSearch("")
    applySearch(undefined)
  }

  const hasSearch = (searchParams.get("search") ?? "") !== ""

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryBox
            theme="billed"
            icon={ReceiptIcon}
            label="Total billed (net)"
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
            label="Total remaining to pay"
            value={formatRupee(summary.totalDue)}
          />
          <SummaryBox
            theme="overdue"
            icon={ClockAlert}
            label="Staff with dues"
            value={summary.pendingCount.toString()}
          />
        </CardContent>
      </Card>

      {/* Search only */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearchSubmit()
            }}
            placeholder="Search staff or teacher by name…"
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearchSubmit}>Search</Button>
        {hasSearch ? (
          <Button variant="outline" onClick={clearSearch} className="gap-2">
            <X className="size-4" />
            Clear
          </Button>
        ) : null}
      </div>

      {/* Table — staff + remaining */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44">Staff name</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Remaining to pay</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <TableRow key={`${employee.payeeType}:${employee.payeeId}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage
                        src={
                          employee.payeeImage
                            ? `/${employee.payeeImage}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {employee.payeeName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {employee.payeeName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {employee.payeeRole ?? employee.payeeType}
                        {employee.outstandingCount > 0
                          ? ` · ${employee.outstandingCount} due`
                          : ` · ${employee.paidCount} paid`}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupee(employee.totalGross)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">
                  -{formatRupee(employee.deductionTotal)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupee(employee.totalNet)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatRupee(employee.totalPaid)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    employee.isOverDue
                      ? "text-warning"
                      : Number(employee.totalRemaining) > 0
                        ? "text-destructive"
                        : "text-emerald-600"
                  )}
                >
                  {formatRupee(employee.totalRemaining)}
                  {employee.isOverDue ? (
                    <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                      Past due date
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>{formatStatus(employee.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/org/dashboard/payroll/employee/${employee.payeeType}/${employee.payeeId}`}
                    >
                      View
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No staff found for this filter. Outstanding (unpaid + partial)
                dues appear here by default.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControls
        totalPages={summary.totalPages}
        perPageOptions={[5, 10, 15, 20]}
      />
    </div>
  )
}
