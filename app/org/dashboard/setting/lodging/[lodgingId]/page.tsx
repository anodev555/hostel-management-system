import React from "react"
import LodgingDetail from "./_components/lodging-detail"

export default function page({
  params,
}: {
  params: Promise<{ lodgingId: string }>
}) {
  return <LodgingDetail params={params} />
}
