"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import {
  UpdateSubscriptionPlanSchemaType,
  updateSubscriptionPlanSchema,
} from "../schema/subscription-schema";

const SUBSCRIPTIONS_PATH = "/admin/dashboard/subscriptions";

function toNullableInt(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export const updateSubscriptionPlanAction = withAuth<
  UpdateSubscriptionPlanSchemaType,
  ActionResponse<{ id: string }>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<{ id: string }>> => {
  try {
    const parsed = updateSubscriptionPlanSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { planId } = parsed.data;
    const name = parsed.data.name.trim();
    const description = parsed.data.description?.trim() || null;
    const price = parsed.data.price.trim();
    const maxStudents = toNullableInt(parsed.data.maxStudents);
    const maxStaff = toNullableInt(parsed.data.maxStaff);

    const [existing] = await db
      .select({ id: subscriptionPlan.id })
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .limit(1);

    if (!existing) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const [duplicate] = await db
      .select({ id: subscriptionPlan.id })
      .from(subscriptionPlan)
      .where(
        and(eq(subscriptionPlan.name, name), ne(subscriptionPlan.id, planId)),
      )
      .limit(1);

    if (duplicate) {
      return {
        success: false,
        message: "A plan with this name already exists",
        fieldErrors: { name: ["A plan with this name already exists"] },
      };
    }

    const [updated] = await db
      .update(subscriptionPlan)
      .set({
        name,
        description,
        price,
        maxStudents,
        maxStaff,
      })
      .where(eq(subscriptionPlan.id, planId))
      .returning({ id: subscriptionPlan.id });

    if (!updated) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    revalidatePath(SUBSCRIPTIONS_PATH);

    return {
      success: true,
      message: `Plan "${name}" updated successfully`,
      data: { id: updated.id },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update subscription plan",
    };
  }
});
