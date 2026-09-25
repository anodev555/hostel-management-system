import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getPayrollEmployeeDetail } from "../../../action/payroll"
import EmployeeDetail from "./_components/employee-detail"

export default async function Page({
  params,
}: {
  params: Promise<{ payeeType: string; payeeId: string }>
}) {
  try {
    const { payeeType, payeeId } = await params
    if (payeeType !== "staff" && payeeType !== "teacher") {
      return <ErrorPage message="Invalid employee type" />
    }
    const response = await getPayrollEmployeeDetail({
      payeeType,
      payeeId,
    })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <EmployeeDetail data={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
