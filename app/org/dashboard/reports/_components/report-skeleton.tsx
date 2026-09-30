import { Skeleton } from "@/components/ui/skeleton"

export default function ReportSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Month range filter skeleton */}
      <div className="flex flex-wrap items-end gap-3">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full max-w-2xl rounded-xl" />

      {/* KPI cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="space-y-4 rounded-2xl border p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}
