"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import db from "@/db";
import { organizationSubscription, subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import { assignSubscriptionSchema } from "../schema/hostel-detail-schema";

export const assignSubscriptionAction = withAuth<
  z.infer<typeof assignSubscriptionSchema>,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data, session }): Promise<ActionResponse<null>> => {
  try {
    const parsed = assignSubscriptionSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { hostelId, planId } = parsed.data;

    const planRows = await db
      .select()
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .limit(1);

    if (planRows.length === 0) {
      return { success: false, message: "Subscription plan not found" };
    }

    const plan = planRows[0];

    await db
      .update(organizationSubscription)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(
        and(
          eq(organizationSubscription.organizationId, hostelId),
          eq(organizationSubscription.status, "active"),
        ),
      );

    const nextBilling = new Date();
    nextBilling.setDate(nextBilling.getDate() + 30);

    await db.insert(organizationSubscription).values({
      organizationId: hostelId,
      planId: plan.id,
      status: "active",
      planName: plan.name,
      priceAtSignup: plan.price ?? "0.00",
      maxStudentsSnapshot: plan.maxStudents,
      maxStaffSnapshot: plan.maxStaff,
      startedAt: new Date(),
      nextBillingDate: nextBilling.toISOString().split("T")[0],
      createdBy: session?.user?.id ?? null,
    });

    revalidatePath(`/admin/dashboard/hostels/${hostelId}`);
    return { success: true, message: `Subscribed to "${plan.name}" plan`, data: null };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to assign subscription" };
  }
});