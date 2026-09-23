import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

import { getOrgBilling } from "../action/org-billing"
import OrgBillingList from "./orgbilling-list"

export default async function OrgBilling({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    page?: string
    perpage?: string
  }>
}) {
  try {
    const { search, page, perpage } = await searchParams
    const response = await getOrgBilling({ search, page, perpage })

    if (!response.success || !response.data) {
      return (
        <ErrorPage message={response.message ?? "Failed to load billing"} />
      )
    }

    return (
      <OrgBillingList
        summary={response.data.summary}
        students={response.data.students}
        totalPages={response.data.totalPages}
      />
    )
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
