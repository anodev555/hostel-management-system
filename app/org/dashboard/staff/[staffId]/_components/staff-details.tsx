import React from "react"
import { getStaffDetailAction } from "../action/get-staffdetail"
import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import ForbiddenPage from "@/utils/forbidden-page"
import UnauthorizedPage from "@/utils/unauthorized-page"
import BadRequestPage from "@/utils/badrequest-page"
import StaffDetailsForm from "./staffdetails-form"
export default async function StaffDetails({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const staffId = (await params).staffId

  try {
    const response = await getStaffDetailAction({ staffId })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <StaffDetailsForm staffData={response.data} />
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
      <ErrorPage
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    )
  }
}
