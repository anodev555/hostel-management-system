import React, { Suspense } from "react"
import Visitors from "./components/visitors"
import VisitorSkeleton from "./components/visitor-skeleton"

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string; perpage?: string }>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<VisitorSkeleton />}>
        <Visitors searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
