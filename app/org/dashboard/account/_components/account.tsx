import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

import { getOrgSubscriptionAction } from "../action/org-subscription"
import AccountManagement from "./account-management"

export default async function Account() {
  try {
    const response = await getOrgSubscriptionAction({})

    if (!response.success) {
      return <ErrorPage message={response.message ?? "Failed to load account"} />
    }

    return <AccountManagement subscription={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}