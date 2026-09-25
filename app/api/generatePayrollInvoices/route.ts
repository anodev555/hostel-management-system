import getPreviousMonth from "@/app/org/dashboard/lib/billings/getPreviousMonth";
import db from "@/db";
import { organization } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  //get previous month period
  const period = getPreviousMonth();
  const orgs = await db
    .select()
    .from(organization)
    .where(eq(organization.isActive, true));

  for (const org of orgs) {
    try {
      const response = await generatePayrollInvoicesPerOrg({
        orgId: org.id,
        period,
      });
    } catch (error) {}
  }
}
