import { Suspense } from "react"
import Lodging from "./_components/lodging"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{
    search: string
  }>
}) {
  return (
    <div>
      <Suspense key={searchParams.toString()} fallback={<div>Loading...</div>}>
        <Lodging searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
