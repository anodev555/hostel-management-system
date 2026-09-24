import { payrollContract } from "@/db/schema";
import { PreviousMonthType } from "./getPreviousMonth";
import db from "@/db";
import { and, eq, lte, gte, isNull, or } from "drizzle-orm";

type PayrollInvoicesPerOrg = {
  orgId: string;
  period: PreviousMonthType;
};
export async function generatePayrollInvoicesPerOrg({
  orgId,
  period,
}: PayrollInvoicesPerOrg) {
  const { periodStart, periodEnd, month, year, daysInMonth } = period;

  const rows = await db
    .select()
    .from(payrollContract)
    .where(
      and(
        eq(payrollContract.organizationId, orgId),
        lte(payrollContract.effectiveFrom, periodEnd),
        or(
          gte(payrollContract.effectiveTo, periodStart),
          isNull(payrollContract.effectiveTo),
        ),
      ),
    );
}
