import React from "react"
import FoodingList from "./fooding-list"
import ErrorPage from "@/utils/error-page"
import { getFoodingListAction } from "../action/fooding"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function Fooding({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  try {
    const { search } = await searchParams
    const response = await getFoodingListAction({ search })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <FoodingList fooding={response.data} />
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
