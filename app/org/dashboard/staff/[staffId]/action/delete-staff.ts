"use server";

import { auth } from "@/lib/auth";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import { revalidatePath } from "next/cache";
import db from "@/db";
import { member, payrollContract, user } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";
import { format } from "date-fns";
import z from "zod";

const deleteStaffSchema = z.object({
  staffId: z.string().trim().min(1, "staff is required"),
});

export const deleteStaffAction = withAuth<
  z.infer<typeof deleteStaffSchema>,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["delete"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please login again",
      };
    }

    const parsed = deleteStaffSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid staff id",
      };
    }

    const { staffId } = parsed.data;

    const [staff] = await db
      .select({
        id: member.id,
        userId: member.userId,
        role: member.role,
      })
      .from(member)
      .where(
        and(eq(member.id, staffId), eq(member.organizationId, organizationId)),
      )
      .limit(1);

    if (!staff) {
      return {
        success: false,
        message: "Staff not found",
      };
    }

    const [activeContracts] = await db
      .select({ count: count() })
      .from(payrollContract)
      .where(
        and(
          eq(payrollContract.memberId, staffId),
          eq(payrollContract.organizationId, organizationId),
          eq(payrollContract.payeeType, "staff"),
          eq(payrollContract.status, "active"),
        ),
      );

    await db.transaction(async (tx) => {
      if (activeContracts.count > 0) {
        await tx
          .update(payrollContract)
          .set({
            status: "inactive",
            effectiveTo: format(new Date(), "yyyy-MM-dd"),
          })
          .where(
            and(
              eq(payrollContract.memberId, staffId),
              eq(payrollContract.organizationId, organizationId),
              eq(payrollContract.payeeType, "staff"),
              eq(payrollContract.status, "active"),
            ),
          );
      }

      await tx
        .delete(member)
        .where(
          and(
            eq(member.id, staffId),
            eq(member.organizationId, organizationId),
          ),
        );

      const [otherMemberships] = await tx
        .select({ count: count() })
        .from(member)
        .where(eq(member.userId, staff.userId));

      //   if (otherMemberships.count === 0) {
      //     await auth.api.removeUser({
      //       body: { userId: staff.userId },
      //       headers,
      //     });
      //   }
    });

    revalidatePath("/org/dashboard/staff");
    revalidatePath(`/org/dashboard/staff/${staffId}`);

    return {
      success: true,
      message: "Staff deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete staff",
    };
  }
});
