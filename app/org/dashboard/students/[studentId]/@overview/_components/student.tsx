import ErrorPage from "@/utils/error-page"
import { studentOverviewAction } from "../action/student-overview"
import Overview from "./overview"
import { AuthActionError } from "@/lib/withAuth"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Student({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  try {
    if (!studentId) {
      return <ErrorPage message="Missing student Params" />
    }

    const response = await studentOverviewAction({ studentId })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }
    return <Overview student={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
