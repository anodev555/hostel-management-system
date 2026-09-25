"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePermissions } from "@/lib/permissions/usePermissions"
import { cn } from "@/lib/utils"
import { PayrollInvoiceDetail } from "@/types/payroll-types"
import {
  AlertCircleIcon,
  ArrowLeft,
  Banknote,
  CircleCheckIcon,
  Mail,
  MinusCircle,
  Phone,
  ReceiptIcon,
  ShieldX,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  formatDateYearMonth,
  formatPaymentMethod,
  formatRupee,
  formatStatus,
  formatYearMonth,
} from "../../../lib/utils"
import { SummaryBox } from "../../../invoices/_components/utils"
import { voidPayrollInvoice } from "../../action/payroll"
import ConfirmDialog from "./confirm-dialog"
import DeductionForm from "./deduction-form"
import DeductionRowActions from "./deduction-row-actions"
import PaySalaryForm from "./pay-salary-form"
import PayoutLogActions from "./payout-log-actions"

const DEDUCTION_REASON_STYLES: Record<string, string> = {
  advance: "bg-indigo-500 text-white",
  loan: "bg-warning text-warning-foreground",
  fine: "bg-destructive text-white",
  other: "bg-muted text-muted-foreground",
}

function DeductionReasonBadge({ reason }: { reason: string }) {
  return (
    <Badge className={cn("capitalize", DEDUCTION_REASON_STYLES[reason])}>
      {reason}
    </Badge>
  )
}

export default function PayrollDetail({
  data,
}: {
  data: PayrollInvoiceDetail
}) {
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [voidOpen, setVoidOpen] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)

  const { invoice, payee, lineItems, deductions, payouts } = data

  const deductionTotal = deductions.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  )
  const remaining = Number(invoice.dueAmount)
  const canVoid = hasPermission("payroll", "delete")
  const canAddDeduction =
    hasPermission("payroll", "create") &&
    (invoice.status === "unpaid" || invoice.status === "partial")

  async function handleVoid() {
    if (isVoiding) return
    try {
      setIsVoiding(true)
      const response = await voidPayrollInvoice({ invoiceId: invoice.id })
      if (response.success) {
        setVoidOpen(false)
        toast.success(response.message ?? "Invoice voided")
        router.refresh()
      } else {
        toast.error(response.message)
        setVoidOpen(false)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      setVoidOpen(false)
    } finally {
      setIsVoiding(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Button variant="outline" asChild>
        <Link href="/org/dashboard/payroll">
          <ArrowLeft className="size-4" />
          Back to payroll
        </Link>
      </Button>

      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Payroll invoice
            </p>
            <CardTitle className="mt-1 text-2xl">
              {invoice.invoiceNumber}
            </CardTitle>
            <CardDescription className="mt-1">
              {formatYearMonth(invoice.periodYear, invoice.periodMonth)} · Issued{" "}
              {formatDateYearMonth(new Date(invoice.issuedAt))} · Due{" "}
              {formatDateYearMonth(new Date(invoice.dueDate))}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {formatStatus(invoice.status)}
            {canVoid && invoice.status !== "void" ? (
              <>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive"
                  onClick={() => setVoidOpen(true)}
                >
                  <ShieldX className="size-4" />
                  Void
                </Button>
                <ConfirmDialog
                  open={voidOpen}
                  onOpenChange={setVoidOpen}
                  title="Void this invoice?"
                  description="The invoice will be marked as void and excluded from summary totals. This cannot be undone."
                  confirmLabel="Void"
                  isLoading={isVoiding}
                  onConfirm={handleVoid}
                />
              </>
            ) : null}
            {invoice.status !== "void" && remaining > 0 ? (
              <PaySalaryForm
                invoiceId={invoice.id}
                payeeName={payee.name}
                remainingAmount={invoice.dueAmount}
              />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryBox
              theme="billed"
              icon={ReceiptIcon}
              label="Gross salary"
              value={formatRupee(invoice.subTotal)}
            />
            <SummaryBox
              theme="overdue"
              icon={MinusCircle}
              label="Deductions"
              value={formatRupee(deductionTotal.toFixed(2))}
            />
            <SummaryBox
              theme="billed"
              icon={Banknote}
              label="Net salary"
              value={formatRupee(invoice.total)}
            />
            <SummaryBox
              theme="paid"
              icon={CircleCheckIcon}
              label="Paid"
              value={formatRupee(invoice.paidAmount)}
            />
            <SummaryBox
              theme={remaining > 0 ? "due" : "paid"}
              icon={remaining > 0 ? AlertCircleIcon : CircleCheckIcon}
              label="Remaining"
              value={formatRupee(invoice.dueAmount)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payee + line items */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage
                  src={payee.image ? `/${payee.image}` : undefined}
                />
                <AvatarFallback>
                  {payee.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{payee.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {payee.role ?? invoice.payeeType}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {payee.phone ? (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" />
                  {payee.phone}
                </p>
              ) : null}
              {payee.email ? (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  {payee.email}
                </p>
              ) : null}
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">
                  Active contract
                </span>
                <span className="font-semibold tabular-nums">
                  {payee.activeContractAmount
                    ? formatRupee(payee.activeContractAmount)
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Salary breakdown</CardTitle>
            <CardDescription>
              Line items for this payroll period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lineItems.length > 0 ? (
              <div className="space-y-1">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.description}</p>
                      {item.chargeStartAt && item.chargeEndAt ? (
                        <p className="text-xs text-muted-foreground">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No line items on this invoice.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deductions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Deductions</CardTitle>
            <CardDescription>
              Advances, loans, fines, or any other salary deductions.
            </CardDescription>
          </div>
          {canAddDeduction && (
            <DeductionForm mode="add" invoiceId={invoice.id} />
          )}
        </CardHeader>
        <CardContent>
          {deductions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Reason</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 text-right font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Added by</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((deduction) => (
                    <tr key={deduction.id} className="border-b">
                      <td className="py-2.5 pr-4">
                        <DeductionReasonBadge reason={deduction.reason} />
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {deduction.description ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-destructive">
                        -{formatRupee(deduction.amount)}
                      </td>
                      <td className="py-2.5 pr-4">
                        {deduction.createdByName ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {formatDateYearMonth(new Date(deduction.createdAt))}
                      </td>
                      <td className="py-2.5 text-right">
                        <DeductionRowActions
                          invoiceId={invoice.id}
                          deduction={deduction}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No deductions on this invoice.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payout log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Salary payout log</CardTitle>
          <CardDescription>
            Every payout recorded against this invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 text-right font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Method</th>
                    <th className="py-2 pr-4 font-medium">Reference</th>
                    <th className="py-2 pr-4 font-medium">Paid by</th>
                    <th className="py-2 pr-4 font-medium">Notes</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b">
                      <td className="py-2.5 pr-4">
                        {formatDateYearMonth(new Date(payout.paidAt))}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatRupee(payout.amount)}
                      </td>
                      <td className="py-2.5 pr-4">
                        {formatPaymentMethod(payout.method)}
                      </td>
                      <td className="py-2.5 pr-4">{payout.reference ?? "—"}</td>
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
    </div>
  )
}