import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getPayrollInvoices } from "../action/payroll"
import PayrollList from "./payroll-list"

const ALLOWED_STATUSES = [
  "outstanding",
  "unpaid",
  "partial",
  "paid",
  "all",
] as const

export default async function Payroll({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  try {
    const params = await searchParams

    const status = ALLOWED_STATUSES.includes(
      (params.status ?? "outstanding") as (typeof ALLOWED_STATUSES)[number]
    )
      ? (params.status as (typeof ALLOWED_STATUSES)[number])
      : "outstanding"

    const response = await getPayrollInvoices({
      payeeType: ["staff", "teacher"].includes(params.payeeType ?? "")
        ? (params.payeeType as "staff" | "teacher")
        : undefined,
      status,
      search: params.search?.trim() || undefined,
      page: params.page ? parseInt(params.page) : 1,
      perPage: params.perpage ? parseInt(params.perpage) : 10,
    })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return (
      <PayrollList
        summary={response.data.summary}
        employees={response.data.employees}
      />
    )
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
