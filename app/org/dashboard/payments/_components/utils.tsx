import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const summaryThemes = {
  collected: {
    card: "border-emerald-500/25 bg-emerald-500/10",
    icon: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/35",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  count: {
    card: "border-primary/20 bg-primary/8",
    icon: "bg-primary text-primary-foreground shadow-lg shadow-primary/35",
    value: "text-foreground",
  },
  late: {
    card: "border-warning/25 bg-warning/8",
    icon: "bg-warning text-warning-foreground shadow-lg shadow-warning/35",
    value: "text-warning",
  },
} as const

export function SummaryBox({
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

export function formatRupee(amount: number | string): string {
  const n = Number(amount)
  return `Rs. ${Number.isFinite(n) ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount}`
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  esewa: "eSewa",
  khalti: "Khalti",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
}

export function formatMethod(method: string) {
  return (
    <Badge variant="outline" className="font-normal">
      {METHOD_LABELS[method] ?? method}
    </Badge>
  )
}

export function formatLate(isLate: boolean) {
  return isLate ? (
    <Badge className="bg-destructive/10 text-destructive">Late</Badge>
  ) : (
    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
      On time
    </Badge>
  )
}

export function formatPaidAt(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}
