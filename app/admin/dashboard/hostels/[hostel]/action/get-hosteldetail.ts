"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";

import db from "@/db";
import {
  member,
  organization,
  organizationSubscription,
  student,
  subscriptionPlan,
  user,
} from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import type { HostelDetail } from "@/types/hostels-types";

const getHostelDetailSchema = z.object({
  hostelId: z.string().min(1, "Hostel ID is required"),
});

export const getHostelDetailAction = withAuth<
  z.infer<typeof getHostelDetailSchema>,
  ActionResponse<HostelDetail>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<HostelDetail>> => {
  try {
    const parsed = getHostelDetailSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { hostelId } = parsed.data;

    const orgRows = await db
      .select()
      .from(organization)
      .where(eq(organization.id, hostelId))
      .limit(1);

    if (orgRows.length === 0) {
      return { success: false, message: "Hostel not found" };
    }

    const org = orgRows[0];

    const [[{ value: studentCount }], [{ value: staffCount }]] =
      await Promise.all([
        db
          .select({ value: count() })
          .from(student)
          .where(eq(student.organizationId, hostelId)),
        db
          .select({ value: count() })
          .from(member)
          .where(
            and(
              eq(member.organizationId, hostelId),
              ne(member.role, "owner"),
            ),
          ),
      ]);

    const ownerRows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.contactPhone,
        image: user.image,
        createdAt: user.createdAt,
        isActive: user.isActive,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(
        and(eq(member.organizationId, hostelId), eq(member.role, "owner")),
      )
      .limit(1);

    const owner = ownerRows.length > 0 ? ownerRows[0] : null;

    const subscriptionRows = await db
      .select({
        id: organizationSubscription.id,
        planId: organizationSubscription.planId,
        planName: organizationSubscription.planName,
        priceAtSignup: organizationSubscription.priceAtSignup,
        status: organizationSubscription.status,
        maxStudentsSnapshot: organizationSubscription.maxStudentsSnapshot,
        maxStaffSnapshot: organizationSubscription.maxStaffSnapshot,
        nextBillingDate: organizationSubscription.nextBillingDate,
        startedAt: organizationSubscription.startedAt,
      })
      .from(organizationSubscription)
      .where(
        and(
          eq(organizationSubscription.organizationId, hostelId),
          eq(organizationSubscription.status, "active"),
        ),
      )
      .limit(1);

    const subscription = subscriptionRows.length > 0 ? subscriptionRows[0] : null;

    const planRows = await db
      .select({
        id: subscriptionPlan.id,
        name: subscriptionPlan.name,
        price: subscriptionPlan.price,
        description: subscriptionPlan.description,
        maxStudents: subscriptionPlan.maxStudents,
        maxStaff: subscriptionPlan.maxStaff,
      })
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.isActive, true))
      .orderBy(subscriptionPlan.name);

    const detail: HostelDetail = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      location: org.location,
      isActive: org.isActive,
      createdAt: org.createdAt,
      totalStudents: Number(studentCount),
      staffCount: Number(staffCount),
      owner,
      subscription,
      availablePlans: planRows.map((p) => ({
        ...p,
        price: p.price,
      })),
    };

    return { success: true, data: detail };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to fetch hostel details" };
  }
});