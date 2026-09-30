import React from "react"
import VisitorManagement from "./visitors-management"
import { getAllVisitorsAction } from "../action/visitors"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Visitors({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string
    to?: string
    page?: string
    perpage?: string
  }>
}) {
  const { from, to, page, perpage } = await searchParams
  try {
    const visitorsResponse = await getAllVisitorsAction({
      from,
      to,
      page: page ?? "1",
      perpage: perpage ?? "5",
    })

    if (!visitorsResponse.success) {
      return <ErrorPage message={visitorsResponse.message || "Failed to load visitors"} />
    }

    return <VisitorManagement visitorsData={visitorsResponse.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
