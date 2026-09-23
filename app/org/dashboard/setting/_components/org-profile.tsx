import React from "react"
import OrgProfileForm from "./orgprofile-form"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getOrganizationProfileAction } from "../action/orgprofile"

export default async function OrgProfile() {
  try {
    const response = await getOrganizationProfileAction()
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }
    return <OrgProfileForm organizationProfile={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
