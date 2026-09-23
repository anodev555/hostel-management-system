import React from "react"
import LodgingList from "./lodging-list"
import { getLodgingAction } from "../action/lodging"
import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function Lodging({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>
}) {
  try {
    const { search } = await searchParams
    const response = await getLodgingAction({ search })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <LodgingList data={response.data} />
  } catch (error) {
    if (error instanceof AuthActionError) {
      if (error.code === "FORBIDDEN") {
        return <ForbiddenPage />
      }
      if (error.code === "UNAUTHORIZED") {
        return <UnauthorizedPage />
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
