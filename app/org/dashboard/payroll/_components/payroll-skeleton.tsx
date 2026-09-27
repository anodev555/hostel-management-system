export default function PayrollSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div className="grid grid-cols-1 gap-2 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-full max-w-xs animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2 rounded-xl border p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
