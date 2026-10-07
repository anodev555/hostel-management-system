"use server";

import z from "zod";
import { eq } from "drizzle-orm";

import db from "@/db";
import { subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import {
  UpdatePlanStatusSchemaType,
  updatePlanStatusSchema,
} from "../schema/subscription-schema";

export const updatePlanStatusAction = withAuth<
  UpdatePlanStatusSchemaType,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<null>> => {
  try {
    const parsed = updatePlanStatusSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { planId, isActive } = parsed.data;

    const [planExists] = await db
      .select({ id: subscriptionPlan.id })
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .limit(1);

    if (!planExists) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const [updated] = await db
      .update(subscriptionPlan)
      .set({ isActive })
      .where(eq(subscriptionPlan.id, planExists.id))
      .returning({ id: subscriptionPlan.id, isActive: subscriptionPlan.isActive });

    if (!updated) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    return {
      success: true,
      message: `Plan marked as ${updated.isActive ? "active" : "inactive"}`,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update plan status",
    };
  }
});
