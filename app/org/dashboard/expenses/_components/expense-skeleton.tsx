export default function ExpenseSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
        <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
      </div>

      {/* Dashboard cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg overflow-hidden">
        <div className="h-12 bg-muted animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-t bg-muted/30 animate-pulse" />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}