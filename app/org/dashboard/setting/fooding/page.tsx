import { Suspense } from "react"

import Fooding from "./_components/fooding"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  return (
    <Suspense key={searchParams.toString()} fallback={<div>Loading...</div>}>
      <Fooding searchParams={searchParams} />
    </Suspense>
  )
}
