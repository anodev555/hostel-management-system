import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getPayrollInvoiceDetail } from "../action/payroll"
import PayrollDetail from "./_components/payroll-detail"

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  try {
    const { invoiceId } = await params
    const response = await getPayrollInvoiceDetail({ invoiceId })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <PayrollDetail data={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}