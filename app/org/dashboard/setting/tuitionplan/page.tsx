import { Suspense } from "react"

import Tuition from "./_components/tuition"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Tuition searchParams={searchParams} />
    </Suspense>
  )
}
