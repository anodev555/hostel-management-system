import ErrorPage from "@/utils/error-page"
import { getAvailableRoomsAction } from "../../lib/shared/get-availableroom"
import { getActiveFoodPlansAction } from "../../lib/shared/get-foodingplan"
import { getActiveTuitionPlansAction } from "../../lib/shared/get-tuitionplan"
import AdmissionWizard from "./admission-wizard"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function NewAdmission() {
  try {
    const [foodPlans, availableRooms, tuitionPlans] = await Promise.all([
      getActiveFoodPlansAction(),
      getAvailableRoomsAction(),
      getActiveTuitionPlansAction(),
    ])

    if (
      !foodPlans.success ||
      !availableRooms.success ||
      !tuitionPlans.success
    ) {
      return (
        <ErrorPage
          message={
            foodPlans.message ||
            availableRooms.message ||
            tuitionPlans.message ||
            "Failed to fetch admission data"
          }
        />
      )
    }

    return (
      <AdmissionWizard
        foodPlans={foodPlans.data}
        availableRooms={availableRooms.data}
        tuitionPlans={tuitionPlans.data}
      />
    )
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
