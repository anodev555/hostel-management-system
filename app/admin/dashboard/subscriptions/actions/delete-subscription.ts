"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { organizationSubscription, subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import {
  DeleteSubscriptionPlanSchemaType,
  deleteSubscriptionPlanSchema,
} from "../schema/subscription-schema";

const SUBSCRIPTIONS_PATH = "/admin/dashboard/subscriptions";

export const deleteSubscriptionPlanAction = withAuth<
  DeleteSubscriptionPlanSchemaType,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<null>> => {
  try {
    const parsed = deleteSubscriptionPlanSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { planId } = parsed.data;

    const [existing] = await db
      .select({ id: subscriptionPlan.id, name: subscriptionPlan.name })
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .limit(1);

    if (!existing) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const [{ value: attachedCount }] = await db
      .select({ value: count() })
      .from(organizationSubscription)
      .where(eq(organizationSubscription.planId, planId));

    if (attachedCount > 0) {
      return {
        success: false,
        message: `Cannot delete "${existing.name}" because ${attachedCount} hostel${attachedCount === 1 ? " is" : "s are"} subscribed to it`,
      };
    }

    const [deleted] = await db
      .delete(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .returning({ id: subscriptionPlan.id });

    if (!deleted) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    revalidatePath(SUBSCRIPTIONS_PATH);

    return {
      success: true,
      message: `Plan "${existing.name}" deleted successfully`,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete subscription plan",
    };
  }
});
