"use server";

import db from "@/db";
import { organizationSubscription, subscriptionPlan } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import {
  ListPlansInput,
  PlanListItem,
  PlanListPayload,
  PlanStatusFilter,
} from "@/types/subscription-types";
import { SQL, and, count, desc, eq, ilike, inArray } from "drizzle-orm";

function buildSearchCondition(search: string): SQL | undefined {
  const term = search.trim();
  if (!term) return undefined;
  return ilike(subscriptionPlan.name, `%${term}%`);
}

function buildStatusCondition(status: PlanStatusFilter): SQL | undefined {
  if (status === "active") return eq(subscriptionPlan.isActive, true);
  if (status === "inactive") return eq(subscriptionPlan.isActive, false);
  return undefined;
}

function combineConditions(conditions: (SQL | undefined)[]) {
  const active = conditions.filter((c): c is SQL => Boolean(c));
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  return and(...active);
}

export const GetSubscriptionsAction = withAuth<
  ListPlansInput,
  ActionResponse<PlanListPayload>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<PlanListPayload>> => {
  try {
    const search = data?.search?.trim() ?? "";
    const status: PlanStatusFilter = data?.status ?? "all";
    const perPage = Math.min(Math.max(Number(data?.perPage) || 5, 1), 20);
    const requestedPage = Math.max(Number(data?.page) || 1, 1);

    const where = combineConditions([
      buildSearchCondition(search),
      buildStatusCondition(status),
    ]);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(subscriptionPlan)
      .where(where);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * perPage;

    const planRows = await db
      .select({
        id: subscriptionPlan.id,
        name: subscriptionPlan.name,
        description: subscriptionPlan.description,
        price: subscriptionPlan.price,
        maxStudents: subscriptionPlan.maxStudents,
        maxStaff: subscriptionPlan.maxStaff,
        isActive: subscriptionPlan.isActive,
        createdAt: subscriptionPlan.createdAt,
      })
      .from(subscriptionPlan)
      .where(where)
      .orderBy(desc(subscriptionPlan.createdAt))
      .limit(perPage)
      .offset(offset);

    const planIds = planRows.map((row) => row.id);

    const subscriberCounts = planIds.length
      ? await db
          .select({
            planId: organizationSubscription.planId,
            value: count(),
          })
          .from(organizationSubscription)
          .where(
            and(
              inArray(organizationSubscription.planId, planIds),
              eq(organizationSubscription.status, "active"),
            ),
          )
          .groupBy(organizationSubscription.planId)
      : [];

    const subscriberByPlan = new Map(
      subscriberCounts.map((row) => [row.planId, Number(row.value)]),
    );

    const plans: PlanListItem[] = planRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      maxStudents: row.maxStudents,
      maxStaff: row.maxStaff,
      isActive: row.isActive,
      subscriberCount: subscriberByPlan.get(row.id) ?? 0,
      createdAt: row.createdAt,
    }));

    return {
      success: true,
      data: {
        plans,
        pagination: { page, perPage, total, totalPages },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch subscription plans",
    };
  }
});
