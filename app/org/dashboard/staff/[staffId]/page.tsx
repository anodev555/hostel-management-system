import React, { Suspense } from "react"
import StaffDetails from "./_components/staff-details"
import StaffDetailsSkeleton from "./_components/staffdetails-skeleton"

export default function Page({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  return (
    <Suspense key={params.toString()} fallback={<StaffDetailsSkeleton />}>
      <StaffDetails params={params} />
    </Suspense>
  )
}
