import React, { Suspense } from "react"
import Expenses from "./_components/expense"
import ExpenseSkeleton from "./_components/expense-skeleton"

export default function Page({
  searchParams,
}: {
  searchParams:Promise< { from?: string; to?: string; page?: string; perpage?: string }>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl ">
      <Suspense fallback={<ExpenseSkeleton />}>
        <Expenses searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
