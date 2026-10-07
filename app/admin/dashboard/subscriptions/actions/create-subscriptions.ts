"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import z from "zod";

import db from "@/db";
import { subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import {
  CreateSubscriptionPlanSchemaType,
  createSubscriptionPlanSchema,
} from "../schema/subscription-schema";

const SUBSCRIPTIONS_PATH = "/admin/dashboard/subscriptions";

function toNullableInt(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export const createSubscriptionPlanAction = withAuth<
  CreateSubscriptionPlanSchemaType,
  ActionResponse<{ id: string }>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<{ id: string }>> => {
  try {
    const parsed = createSubscriptionPlanSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const name = parsed.data.name.trim();
    const description = parsed.data.description?.trim() || null;
    const price = parsed.data.price.trim();
    const maxStudents = toNullableInt(parsed.data.maxStudents);
    const maxStaff = toNullableInt(parsed.data.maxStaff);

    const [existing] = await db
      .select({ id: subscriptionPlan.id })
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.name, name))
      .limit(1);

    if (existing) {
      return {
        success: false,
        message: "A plan with this name already exists",
        fieldErrors: { name: ["A plan with this name already exists"] },
      };
    }

    const [created] = await db
      .insert(subscriptionPlan)
      .values({
        name,
        description,
        price,
        maxStudents,
        maxStaff,
      })
      .returning({ id: subscriptionPlan.id });

    if (!created) {
      return {
        success: false,
        message: "Failed to create subscription plan",
      };
    }

    revalidatePath(SUBSCRIPTIONS_PATH);

    return {
      success: true,
      message: `Plan "${name}" created successfully`,
      data: { id: created.id },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create subscription plan",
    };
  }
});
