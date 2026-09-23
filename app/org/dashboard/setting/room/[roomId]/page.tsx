import React from "react"
import RoomDetail from "./_components/room-detail"

export default function page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  return <RoomDetail params={params} />
}
