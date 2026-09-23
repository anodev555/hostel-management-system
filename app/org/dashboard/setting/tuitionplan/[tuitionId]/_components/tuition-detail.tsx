import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import ForbiddenPage from "@/utils/forbidden-page"
import UnauthorizedPage from "@/utils/unauthorized-page"
import BadRequestPage from "@/utils/badrequest-page"

import { getSpecificTuitionAction } from "../../action/tuition"
import TuitionEditForm from "./tuition-editform"

export default async function TuitionDetail({
  params,
}: {
  params: Promise<{ tuitionId: string }>
}) {
  const tuitionPlanId = (await params).tuitionId

  try {
    const response = await getSpecificTuitionAction({ tuitionPlanId })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <TuitionEditForm tuitionPlan={response.data} />
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
