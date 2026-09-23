import React, { Suspense } from "react"
import Room from "./_components/room"

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; perPage?: string }>
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Room searchParams={searchParams} />
    </Suspense>
  )
}
