"use server";

import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import { revalidatePath } from "next/cache";
import db from "@/db";
import { member, user } from "@/db/schema";
import { session as sessionTable } from "@/db/schema/auth-schema";
import { payrollContract } from "@/db/schema/payroll-schema";
import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import z from "zod";

const markStaffLeftSchema = z.object({
  staffId: z.string().trim().min(1, "Staff is required"),
  // Last working day (yyyy-MM-dd). Defaults to today. Cannot be in the future.
  lastWorkingDay: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected yyyy-MM-dd)")
    .optional(),
});

export const markStaffLeftAction = withAuth<
  z.infer<typeof markStaffLeftSchema>,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please login again",
      };
    }

    const parsed = markStaffLeftSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid input",
      };
    }

    const { staffId } = parsed.data;
    const today = format(new Date(), "yyyy-MM-dd");
    const lastWorkingDay = parsed.data.lastWorkingDay ?? today;
    if (lastWorkingDay > today) {
      return {
        success: false,
        message: "Last working day cannot be in the future",
      };
    }

    const [staff] = await db
      .select({
        id: member.id,
        userId: member.userId,
        isActive: user.isActive,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
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

    if (staff.userId === session?.user.id) {
      return {
        success: false,
        message: "You can't mark your own account as left!",
      };
    }

    if (staff.isActive === false) {
      return {
        success: false,
        message: "Staff has already left",
      };
    }

    await db.transaction(async (tx) => {
      // End all open salary contracts as of the last working day.
      // effectiveTo is clamped per-contract so it never precedes
      // effectiveFrom (DB check constraint).
      const openContracts = await tx
        .select({
          id: payrollContract.id,
          effectiveFrom: payrollContract.effectiveFrom,
        })
        .from(payrollContract)
        .where(
          and(
            eq(payrollContract.memberId, staffId),
            eq(payrollContract.organizationId, organizationId),
            eq(payrollContract.payeeType, "staff"),
            eq(payrollContract.status, "active"),
          ),
        );

      for (const contract of openContracts) {
        const effectiveTo =
          lastWorkingDay < contract.effectiveFrom
            ? contract.effectiveFrom
            : lastWorkingDay;
        await tx
          .update(payrollContract)
          .set({
            status: "inactive",
            effectiveTo,
            updatedBy: session.user.id,
          })
          .where(eq(payrollContract.id, contract.id));
      }

      // Deactivate login...
      await tx
        .update(user)
        .set({ isActive: false })
        .where(eq(user.id, staff.userId));

      // ...and kick any live sessions immediately.
      await tx.delete(sessionTable).where(eq(sessionTable.userId, staff.userId));
    });

    revalidatePath("/org/dashboard/staff");
    revalidatePath(`/org/dashboard/staff/${staffId}`);

    return {
      success: true,
      message: "Staff marked as left. Contracts ended and login deactivated.",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to mark staff as left",
    };
  }
});
