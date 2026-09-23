import { cn } from "@/lib/utils"

export const summaryThemes = {
  totalOutstanding: {
    card: "border-primary/20 bg-primary/8",
    icon: "bg-primary text-primary-foreground shadow-lg shadow-primary/35",
    value: "text-foreground",
  },
  totalOverdue: {
    card: "border-destructive/25 bg-destructive/8",
    icon: "bg-destructive text-white shadow-lg shadow-destructive/35",
    value: "text-destructive",
  },
  studentsWithDue: {
    card: "border-border bg-muted/40",
    icon: "bg-muted text-foreground",
    value: "text-foreground",
  },
  overdueCount: {
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
