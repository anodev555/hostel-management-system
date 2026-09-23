import { PreviousMonthType } from "./getPreviousMonth"

type PayrollInvoicesPerOrg={
    orgId:string,
    period:PreviousMonthType
}
export async function generatePayrollInvoicesPerOrg({
    orgId,
    period
}:PayrollInvoicesPerOrg){

    

}