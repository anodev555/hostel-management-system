"use server"

import db from "@/db"
import { organizationSubscription, subscriptionPlan } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { and, eq } from "drizzle-orm"

export type OrgSubscriptionInfo = {
  planName: string
  price: string
  status: string
  maxStudents: number | null
  maxStaff: number | null
  nextBillingDate: string
  startedAt: Date
  description: string | null
}

export const getOrgSubscriptionAction = withAuth<
  Record<string, never>,
  ActionResponse<OrgSubscriptionInfo | null>
>({
  roles: ["orgUser"],
  requireActiveOrg: true,
})(async ({ organizationId }): Promise<ActionResponse<OrgSubscriptionInfo | null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" }
    }

    const rows = await db
      .select({
        planName: organizationSubscription.planName,
        price: organizationSubscription.priceAtSignup,
        status: organizationSubscription.status,
        maxStudents: organizationSubscription.maxStudentsSnapshot,
        maxStaff: organizationSubscription.maxStaffSnapshot,
        nextBillingDate: organizationSubscription.nextBillingDate,
        startedAt: organizationSubscription.startedAt,
        description: subscriptionPlan.description,
      })
      .from(organizationSubscription)
      .innerJoin(
        subscriptionPlan,
        eq(organizationSubscription.planId, subscriptionPlan.id),
      )
      .where(
        and(
          eq(organizationSubscription.organizationId, organizationId),
          eq(organizationSubscription.status, "active"),
        ),
      )
      .limit(1)

    if (rows.length === 0) {
      return { success: true, data: null }
    }

    return { success: true, data: rows[0] }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to fetch subscription info" }
  }
})