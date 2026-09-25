export default function PayrollSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 sm:flex-row">
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border bg-muted"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border bg-muted" />
    </div>
  )
}