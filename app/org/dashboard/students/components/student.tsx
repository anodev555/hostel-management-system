import React from "react"
import StudentList from "./student-list"
import { getStudentsAction } from "../action/student"
import ErrorPage from "@/utils/error-page"
import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "@/utils/unauthorized-page"
import ForbiddenPage from "@/utils/forbidden-page"
import BadRequestPage from "@/utils/badrequest-page"

export default async function Student({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    perpage?: string
    search?: string
    status?: string
  }>
}) {
  try {
    const { page, perpage, search, status } = await searchParams
    const response = await getStudentsAction({
      page: page,
      perPage: perpage,
      search: search,
      status: status,
    })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }
    return (
      <StudentList
        students={response.data.students}
        total={response.data.total}
        totalPages={response.data.totalPages}
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

    return <ErrorPage message="An unknown error occurred" />
  }
}
