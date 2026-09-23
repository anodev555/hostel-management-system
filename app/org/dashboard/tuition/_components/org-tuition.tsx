import React from "react"
import OrgTuitionList from "./orgtuition-list"
import { getOrgTuitions } from "../action/org-tuition"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function OrgTuition() {
  try {
    const response = await getOrgTuitions()
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <OrgTuitionList tuitionPlans={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
