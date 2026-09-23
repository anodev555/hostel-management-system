import React from "react"
import StaffList from "./staff-list"
import { getAllStaffAction } from "../action/getall-staff"
import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function Staff({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  try {
    const response = await getAllStaffAction({
      search,
    })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <StaffList staffs={response.data} />
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

    return <ErrorPage message="An unknown error occurred" />
  }
}
