import { Suspense } from "react"
import Student from "./_components/student"
import OverviewSkeleton from "./_components/overview-skeleton"

export default async function Page({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Student params={params} />
    </Suspense>
  )
}
