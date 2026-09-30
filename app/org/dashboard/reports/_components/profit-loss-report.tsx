import { formatRupee, money } from "@/app/org/dashboard/lib/utils"
import { cn } from "@/lib/utils"

import type { FlowSide, ProfitLossData } from "@/types/profit-loss-types"

import { ProfitLossChart } from "./report-charts"
import { EXPENSE_CATEGORY_COLORS } from "./report-chart-config"
import { ReportCard } from "./report-primitives"

function Amount({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        value < 0 ? "text-destructive" : "text-foreground",
        className
      )}
    >
      {formatRupee(money(value))}
    </span>
  )
}

function Card({
  label,
  hint,
  children,
  tone = "default",
}: {
  label: string
  hint?: string
  children: React.ReactNode
  tone?: "default" | "in" | "out" | "good" | "bad"
}) {
  const tones = {
    default: "border-border",
    in: "border-emerald-500/25 bg-emerald-500/10",
    out: "border-amber-500/25 bg-amber-500/10",
    good: "border-emerald-500/30 bg-emerald-500/10",
    bad: "border-destructive/30 bg-destructive/10",
  } as const

  return (
    <div className={cn("rounded-2xl border px-4 py-4", tones[tone])}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{children}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * A single horizontal bar split into two segments, used to show
 * collected-vs-outstanding. Widths are a percentage of the combined figure so
 * the pair always reads as one whole.
 */
function SplitBar({
  cash,
  outstanding,
  cashColor,
  outstandingColor,
  cashLabel,
  outstandingLabel,
}: {
  cash: number
  outstanding: number
  cashColor: string
  outstandingColor: string
  cashLabel: string
  outstandingLabel: string
}) {
  const total = cash + outstanding
  const cashPct = total > 0 ? (cash / total) * 100 : 0
  const outstandingPct = total > 0 ? (outstanding / total) * 100 : 0

  if (total === 0) {
    return (
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" />
    )
  }

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      <div style={{ width: `${cashPct}%`, backgroundColor: cashColor }} />
      <div
        style={{ width: `${outstandingPct}%`, backgroundColor: outstandingColor }}
      />
    </div>
  )
}

function FlowRow({
  side,
  cashLabel,
  cashColor,
  outstandingColor,
  outstandingNote,
  extra,
}: {
  side: FlowSide
  cashLabel: string
  cashColor: string
  outstandingColor: string
  outstandingNote?: string
  extra?: { label: string; value: number } | null
}) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 gap-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {cashLabel}
          </dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            <Amount value={side.cash} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Outstanding
          </dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            {side.outstanding > 0 ? (
              <Amount value={side.outstanding} className="text-amber-600" />
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </dd>
          {outstandingNote ? (
            <p className="text-xs text-muted-foreground">{outstandingNote}</p>
          ) : null}
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Invoiced
          </dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            {side.invoiced > 0 ? (
              <Amount value={side.invoiced} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        {extra ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {extra.label}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {extra.value > 0 ? (
                <Amount value={extra.value} className="text-amber-600" />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      <SplitBar
        cash={side.cash}
        outstanding={side.outstanding}
        cashColor={cashColor}
        outstandingColor={outstandingColor}
        cashLabel={cashLabel}
        outstandingLabel="Outstanding"
      />

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ backgroundColor: cashColor }}
          />
          {cashLabel}: {formatRupee(money(side.cash))}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ backgroundColor: outstandingColor }}
          />
          Outstanding: {formatRupee(money(side.outstanding))}
        </span>
      </div>
    </div>
  )
}

export default function ProfitLossReport({ data }: { data: ProfitLossData }) {
  const { students, payroll, operations } = data
  const moneyOut = payroll.cash + operations.cash
  const isEmpty =
    students.cash === 0 &&
    students.outstanding === 0 &&
    moneyOut === 0 &&
    operations.cash === 0

  return (
    <div className="w-full flex-col space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Money in" hint="Collected from students" tone="in">
          <Amount value={students.cash} />
        </Card>
        <Card
          label="Money out"
          hint="Payroll paid + operational spend"
          tone="out"
        >
          <Amount value={moneyOut} />
        </Card>
        <Card
          label="Net cash position"
          hint="Money in less money out"
          tone={data.netCash < 0 ? "bad" : "good"}
        >
          <Amount value={data.netCash} />
        </Card>
        <Card
          label="Net position"
          hint="Billed less invoiced and spent"
          tone={data.netPosition < 0 ? "bad" : "good"}
        >
          <Amount value={data.netPosition} />
        </Card>
      </div>

      {isEmpty ? (
        <ReportCard title="Cash and outstanding">
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No money moved and nothing outstanding in this range
          </div>
        </ReportCard>
      ) : (
        <>
          <ReportCard
            title="Money in — students"
            description="Cash collected during the range, against what is still owed on invoices raised in the range."
          >
            <FlowRow
              side={students}
              cashLabel="Collected"
              cashColor="#10b981"
              outstandingColor="#f59e0b"
              outstandingNote="on invoices raised in range"
              extra={
                students.collectedLate > 0
                  ? { label: "Collected late", value: students.collectedLate }
                  : null
              }
            />
          </ReportCard>

          <ReportCard
            title="Money out — payroll"
            description="Cash paid to staff and teachers during the range, against what is still owed on payroll raised in the range."
          >
            <FlowRow
              side={payroll}
              cashLabel="Paid out"
              cashColor="#f59e0b"
              outstandingColor="#dc2626"
              outstandingNote="on payroll raised in range"
            />
          </ReportCard>

          <ReportCard
            title="Money out — operations"
            description="Recorded in the expenses table. Each row is created once the money has already gone, so there is never anything outstanding here."
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cash spent
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    <Amount value={operations.cash} />
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </p>
                  <p className="mt-0.5 text-lg font-semibold text-muted-foreground">
                    None
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {operations.categoryTotals
                  .filter((item) => item.total > 0)
                  .map((item) => (
                    <li key={item.category} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: EXPENSE_CATEGORY_COLORS[item.category],
                            }}
                          />
                          <span className="truncate font-medium">{item.label}</span>
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatRupee(money(item.total))} · {item.share}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-[width]"
                          style={{
                            width: `${item.share}%`,
                            backgroundColor: EXPENSE_CATEGORY_COLORS[item.category],
                          }}
                        />
                      </div>
                    </li>
                  ))}
                {operations.cash === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No operational spending recorded in this range.
                  </li>
                ) : null}
              </ul>
            </div>
          </ReportCard>

          <ReportCard title="Cash in and out by month">
            <ProfitLossChart data={data} />
          </ReportCard>

          <p className="text-xs text-muted-foreground">
            Collected and outstanding are measured on different timelines —
            collected when the cash arrived, outstanding as a live balance on
            invoices raised in the range. Because a payment can settle an older
            bill, the two are never added together. "Net cash" uses the cash
            figures; "Net position" uses the invoiced figures, which is the
            conventional bottom line.
          </p>
        </>
      )}
    </div>
  )
}
