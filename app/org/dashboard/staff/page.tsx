import React, { Suspense } from "react"
import Staff from "./_components/staff"
import StaffHeader from "./_components/staff-header"
import StaffListSkeleton from "./_components/stafflist-skeleton"

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <StaffHeader />
      <Suspense key={searchParams.toString()} fallback={<StaffListSkeleton />}>
        <Staff searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
