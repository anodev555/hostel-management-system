import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import BadRequestPage from "@/utils/badrequest-page"
import ForbiddenPage from "@/utils/forbidden-page"
import UnauthorizedPage from "@/utils/unauthorized-page"

import { getTeacherDetailAction } from "../action/teacher-updatedelete"
import EditTeacherForm from "./editteacher-form"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function EditTeacher({
  params,
}: {
  params: Promise<{ teacherId: string }>
}) {
  const { teacherId } = await params

  try {
    const response = await getTeacherDetailAction({ teacherId })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <EditTeacherForm teacher={response.data} />
  } catch (error) {
    ;<ErrorResolver error={error} />
  }
}
