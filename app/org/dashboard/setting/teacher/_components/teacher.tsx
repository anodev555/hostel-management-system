import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import BadRequestPage from "@/utils/badrequest-page"
import ForbiddenPage from "@/utils/forbidden-page"
import UnauthorizedPage from "@/utils/unauthorized-page"

import { getTeachersAction } from "../action/teacher"
import TeacherList from "./teacher-list"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Teacher({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; perpage?: string }>
}) {
  try {
    const { search, page, perpage } = await searchParams
    const response = await getTeachersAction({ search, page, perpage })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <TeacherList data={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
