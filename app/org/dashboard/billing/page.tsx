import { Suspense } from "react"

import LoadingBar from "@/components/loading-bar"

import OrgBilling from "./_components/org-billing"
import BillingSkeleton from "./_components/billing-skeleton"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    page?: string
    perpage?: string
  }>
}) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <Suspense fallback={<BillingSkeleton />}>
        <OrgBilling searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
