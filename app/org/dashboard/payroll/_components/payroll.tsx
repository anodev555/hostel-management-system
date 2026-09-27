import ErrorPage from "@/utils/error-page";
import { ErrorResolver } from "@/utils/error-resolver";
import { getPayrollInvoices } from "../action/payroll";
import PayrollList from "./payroll-list";

export default async function Payroll({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  try {
    const params = await searchParams;

    const response = await getPayrollInvoices({
      status: "all",
      search: params.search?.trim() || undefined,
      page: params.page ? parseInt(params.page) : 1,
      perPage: params.perpage ? parseInt(params.perpage) : 10,
    });

    if (!response.success) {
      return <ErrorPage message={response.message} />;
    }

    return (
      <PayrollList
        summary={response.data.summary}
        employees={response.data.employees}
      />
    );
  } catch (error) {
    return <ErrorResolver error={error} />;
  }
}
