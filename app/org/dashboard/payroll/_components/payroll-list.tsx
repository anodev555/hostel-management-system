"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/pagination-controls";
import { PayrollEmployeeRow, PayrollSummary } from "@/types/payroll-types";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  CircleCheckIcon,
  ClockAlert,
  ReceiptIcon,
  Search,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { formatRupee, formatStatus } from "../../lib/utils";
import { SummaryBox } from "../../invoices/_components/utils";
import { usePermissions } from "@/lib/permissions/usePermissions";

export default function PayrollList({
  summary,
  employees,
}: {
  summary: PayrollSummary;
  employees: PayrollEmployeeRow[];
}) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const applySearch = useCallback(
    (value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") {
        params.delete("search");
      } else {
        params.set("search", value);
      }
      params.delete("page");
      const query = params.toString();
      router.push(
        query ? `/org/dashboard/payroll?${query}` : "/org/dashboard/payroll",
      );
    },
    [router, searchParams],
  );

  function handleSearchSubmit() {
    applySearch(search.trim() || undefined);
  }

  function clearSearch() {
    setSearch("");
    applySearch(undefined);
  }

  const hasSearch = (searchParams.get("search") ?? "") !== "";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Payroll</h1>
        <p className="text-muted-foreground text-sm">
          Manage the salary payment, deduction and calulation
        </p>
      </div>

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
              if (event.key === "Enter") handleSearchSubmit();
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

      {/* Table — one row per staff / teacher */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="">Remaining to pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length > 0 ? (
            employees.map((employee) => {
              const cleared = Number(employee.totalRemaining) <= 0;
              return (
                <TableRow
                  key={`${employee.payeeType}:${employee.payeeId}`}

                  onClick={() => {
                    if (hasPermission("payroll", "read")) {
                      router.push(
                        `/org/dashboard/payroll/employee/${employee.payeeType}/${employee.payeeId}`,
                      );
                    }
                  }}
                >
                  <TableCell className="font-medium">
                    {employee.payeeName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {employee.payeeType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cleared ? (
                      <Badge className="bg-emerald-500 text-white">
                        Cleared
                      </Badge>
                    ) : (
                      formatStatus(employee.status)
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      " font-semibold tabular-nums",
                      cleared
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {formatRupee(employee.totalRemaining)}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No staff or teachers found. Try a different search.
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
  );
}
