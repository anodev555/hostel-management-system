import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getPaymentsPerStudent } from "../action/payment"
import PaymentList from "./payment-list"

export default async function Payment({
  searchParams,
}: {
  searchParams: Promise<{
    studentId?: string
    page?: string
    perPage?: string
  }>
}) {
  try {
    const params = await searchParams

    const { studentId, page, perPage } = params

    if (!studentId) {
      return <ErrorPage message="Student ID is required" />
    }

    const response = await getPaymentsPerStudent({
      studentId,
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 12,
    })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    const { student, summary, payments } = response.data

    return (
      <PaymentList student={student} payments={payments} summary={summary} />
    )
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
