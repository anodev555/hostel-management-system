import LoadingBar from "@/components/loading-bar"
import React, { Suspense } from "react"
import Billing from "./components/billing"
import BillingSkeleton from "./components/billing-skeleton"

export default async function Page({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <Billing params={params} />
    </Suspense>
  )
}
