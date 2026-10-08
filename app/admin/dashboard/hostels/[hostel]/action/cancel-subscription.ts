"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import db from "@/db";
import { organizationSubscription } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import { cancelSubscriptionSchema } from "../schema/hostel-detail-schema";

export const cancelSubscriptionAction = withAuth<
  z.infer<typeof cancelSubscriptionSchema>,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<null>> => {
  try {
    const parsed = cancelSubscriptionSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { subscriptionId } = parsed.data;

    const existing = await db
      .select({ organizationId: organizationSubscription.organizationId })
      .from(organizationSubscription)
      .where(
        and(
          eq(organizationSubscription.id, subscriptionId),
          eq(organizationSubscription.status, "active"),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: "Active subscription not found" };
    }

    await db
      .update(organizationSubscription)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(organizationSubscription.id, subscriptionId));

    revalidatePath(`/admin/dashboard/hostels/${existing[0].organizationId}`);
    return { success: true, message: "Subscription cancelled", data: null };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to cancel subscription" };
  }
});