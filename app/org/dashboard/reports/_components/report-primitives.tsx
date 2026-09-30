import { formatRupee, money } from "@/app/org/dashboard/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Shared shell for every report panel. Kept free of recharts so it can stay
 * a server component; only the chart bodies opt into the client.
 */
export function ReportCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ReportEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export type BreakdownItem = {
  label: string
  total: number
  share: number
  color: string
}

/**
 * Share-of-total bars. Pure CSS rather than a chart, so the numbers stay
 * readable as text and the component stays server-renderable.
 */
export function ShareBars({ items }: { items: BreakdownItem[] }) {
  if (items.length === 0) {
    return <ReportEmpty message="No data in this range" />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
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
                backgroundColor: item.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
