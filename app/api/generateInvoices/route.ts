import db from "@/db"
import getPreviousMonth from "@/app/org/dashboard/lib/billings/getPreviousMonth"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import generateInvoicesPerOrg, {
  GenerateInvoicesPerOrgResponse,
} from "@/app/org/dashboard/lib/billings/generateInvoicesPerOrg"

type OrgGenerateResult = {
  organizationId: string
  status: "created" | "empty" | "failed"
  createdCount: number // student invoices created this run
  skippedCount: number // already had a non-void invoice this month
  error?: string // only if status === "failed"
}

export async function POST(request: Request) {
  //get previous month period
  const period = getPreviousMonth()

  const orgs = await db.select().from(organization).where(eq(organization.isActive, true))

  const results: OrgGenerateResult[] = []

  for (const org of orgs) {
    try {
      const response: GenerateInvoicesPerOrgResponse =
        await generateInvoicesPerOrg({
          orgId: org.id,
          period,
        })
      results.push({
        organizationId: org.id,
        status: response.status,
        createdCount: response.createdCount,
        skippedCount: response.skippedCount,
      })
    } catch (error) {
      results.push({
        organizationId: org.id,
        status: "failed",
        createdCount: 0,
        skippedCount: 0,
        error: error instanceof Error ? error.message : "Something went wrong",
      })
    }
  }

  const failed = results.filter((r) => r.status === "failed")
  const payload = {
    period: {
      year: period.year,
      month: period.month,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
    },
    orgCount: results.length,
    createdOrgs: results.filter((r) => r.status === "created").length,
    failedOrgs: failed.length,
    emptyOrgs: results.filter((r) => r.status === "empty").length,
    results,
  }

  console.log(JSON.stringify(payload))

  return Response.json(
    {
      ok: failed.length === 0,
      failed,
    },
    {
      status: failed.length > 0 ? 500 : 200,
    }
  )
}
