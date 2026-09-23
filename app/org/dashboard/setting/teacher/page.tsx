import { Suspense } from "react"

import Teacher from "./_components/teacher"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; perpage?: string }>
}) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading teachers...</div>}>
      <Teacher searchParams={searchParams} />
    </Suspense>
  )
}
