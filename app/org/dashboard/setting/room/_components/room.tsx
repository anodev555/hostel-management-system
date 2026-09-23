import React from "react"
import RoomList from "./room-list"
import { getRoomsAction } from "../action/rooms"
import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function Room({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; perpage?: string }>
}) {
  const { search, page, perpage } = await searchParams
  try {
    const response = await getRoomsAction({ search, page, perpage })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }
    const { rooms, total, totalPages } = response.data
    return <RoomList rooms={rooms} total={total} totalPages={totalPages} />
  } catch (error) {
    if (error instanceof AuthActionError) {
      if (error.code === "UNAUTHORIZED") {
        return <UnauthorizedPage />
      }
      if (error.code === "FORBIDDEN") {
        return <ForbiddenPage />
      }
      if (error.code === "BAD_REQUEST") {
        return <BadRequestPage />
      }
    }
    return (
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 rounded-md bg-red-500 p-4 text-white">
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    )
  }
}
