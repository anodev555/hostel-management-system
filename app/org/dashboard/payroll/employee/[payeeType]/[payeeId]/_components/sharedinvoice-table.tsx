import { PayrollEmployeeInvoiceRow } from "@/types/payroll-types";
import { Fragment, useState } from "react";
import { getPayrollInvoiceDetail } from "../../../../action/payroll";
import {
  formatDateYearMonth,
  formatRupee,
  formatStatus,
  formatYearMonth,
} from "@/app/org/dashboard/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { Badge, EyeClosed, EyeIcon, EyeOff } from "lucide-react";
import AddDeductionForm from "./deduction/add-deduction-form";
import DeductionRowActions from "./deduction-row-actions";

export function InvoiceTable({
  rows,
  emptyMessage,
  showDeductionActions,
}: {
  rows: PayrollEmployeeInvoiceRow[];
  emptyMessage: string;
  showDeductionActions: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deductionsByInvoice, setDeductionsByInvoice] = useState<
    Record<string, Awaited<ReturnType<typeof getPayrollInvoiceDetail>>>
  >({});

  async function toggleDeductions(invoiceId: string) {
    if (expanded === invoiceId) {
      setExpanded(null);
      return;
    }
    setExpanded(invoiceId);
    if (!deductionsByInvoice[invoiceId]) {
      const res = await getPayrollInvoiceDetail({ invoiceId });
      if (res.success) {
        setDeductionsByInvoice((prev) => ({ ...prev, [invoiceId]: res }));
      }
    }
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Invoice / Period</th>
            <th className="py-2 pr-4 text-right font-medium">Gross</th>
            <th className="py-2 pr-4 text-right font-medium">Deduction</th>
            <th className="py-2 pr-4 text-right font-medium">Net</th>
            <th className="py-2 pr-4 text-right font-medium">Paid</th>
            <th className="py-2 pr-4 text-right font-medium">Remaining</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 text-right font-medium">Deductions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const canDeduct =
              row.status === "unpaid" || row.status === "partial";
            const detail = deductionsByInvoice[row.id];
            const deductions =
              detail && detail.success ? detail.data.deductions : [];
            return (
              <Fragment key={row.id}>
                <tr className="border-b last:border-0">
                  <td className="py-2.5 pr-4">
                    <p className="font-mono text-xs font-medium">
                      {row.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatYearMonth(row.periodYear, row.periodMonth)}
                    </p>
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {formatRupee(row.subTotal)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-destructive">
                    -{formatRupee(row.deductionTotal)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                    {formatRupee(row.total)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatRupee(row.paidAmount)}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-4 text-right font-semibold tabular-nums",
                      Number(row.dueAmount) > 0
                        ? "text-destructive"
                        : "text-emerald-600",
                    )}
                  >
                    {formatRupee(row.dueAmount)}
                  </td>
                  <td className="py-2.5 pr-4">{formatStatus(row.status)}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {showDeductionActions && canDeduct ? (
                        <AddDeductionForm invoiceId={row.id} />
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDeductions(row.id)}
                      >
                        {expanded === row.id ? <EyeOff /> : <EyeIcon />}
                      </Button>
                    </div>
                  </td>
                </tr>
                {expanded === row.id ? (
                  <tr
                    key={`${row.id}-deductions`}
                    className="border-b bg-muted/30"
                  >
                    <td colSpan={8} className="px-4 py-3">
                      {deductions.length > 0 ? (
                        <div className="space-y-1.5">
                          {deductions.map((d) => (
                            <div
                              key={d.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "capitalize",
                                    //   DEDUCTION_REASON_STYLES[d.reason],
                                  )}
                                >
                                  {d.reason}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {d.description ?? "—"} ·{" "}
                                  {formatDateYearMonth(new Date(d.createdAt))}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold tabular-nums text-destructive">
                                  -{formatRupee(d.amount)}
                                </span>
                                {showDeductionActions && canDeduct ? (
                                  <DeductionRowActions
                                    invoiceId={row.id}
                                    deduction={d}
                                  />
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-muted-foreground">
                          No deductions on this invoice.
                        </p>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
