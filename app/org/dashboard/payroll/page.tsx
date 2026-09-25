import React, { Suspense } from "react"
import Payroll from "./_components/payroll"
import PayrollSkeleton from "./_components/payroll-skeleton"

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<PayrollSkeleton />}>
        <Payroll searchParams={searchParams} />
      </Suspense>
    </div>
  )
}