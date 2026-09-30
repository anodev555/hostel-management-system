import { Suspense } from "react"

import Reports from "./_components/reports"
import ReportSkeleton from "./_components/report-skeleton"

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    fromYear?: string
    fromMonth?: string
    toYear?: string
    toMonth?: string
  }>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<ReportSkeleton />}>
        <Reports searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
