import React from "react"

import { AuthActionError } from "@/lib/withAuth"
import BadRequestPage from "@/utils/badrequest-page"
import ErrorPage from "@/utils/error-page"
import ForbiddenPage from "@/utils/forbidden-page"
import UnauthorizedPage from "@/utils/unauthorized-page"

import { getTuitionListAction } from "../action/tuition"
import TuitionList from "./tuition-list"

export default async function Tuition({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  try {
    const { search } = await searchParams
    const response = await getTuitionListAction({ search })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <TuitionList tuitionPlans={response.data} />
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
