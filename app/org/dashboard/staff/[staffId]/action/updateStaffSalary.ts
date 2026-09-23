"use server"

import { withAuth } from "@/lib/withAuth"
import { staffSalarySchema, StaffSalarySchemaType } from "../schema/staffSalary"
import { ActionResponse } from "@/types/action-response"
import z from "zod"
import db from "@/db"
import { member, payrollContract } from "@/db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
export const updateStaffSalaryAction = withAuth<
  StaffSalarySchemaType,
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
        message: "Organization not found",
      }
    }
    const parsedData = staffSalarySchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors,
      }
    }
    const { staffId, monthlyAmount } = parsedData.data

    const [staff] = await db
      .select({
        id: member.id,
      })
      .from(member)
      .where(
        and(eq(member.id, staffId), eq(member.organizationId, organizationId))
      )

    if (!staff) {
      return {
        success: false,
        message: "Staff not found",
      }
    }

    const [existingContract] = await db
      .select({
        id: payrollContract.id,
      })
      .from(payrollContract)
      .where(
        and(
          eq(payrollContract.memberId, staffId),
          eq(payrollContract.organizationId, organizationId),
          eq(payrollContract.status, "active"),
          eq(payrollContract.payeeType, "staff"),
          isNull(payrollContract.effectiveTo)
        )
      )
      .limit(1)

    await db.transaction(async (tx) => {
      if (existingContract) {
        await tx
          .update(payrollContract)
          .set({
            status: "inactive",
            effectiveTo: format(new Date(), "yyyy-MM-dd"),
            updatedBy: session.user.id,
          })
          .where(eq(payrollContract.id, existingContract.id))
      }

      await tx.insert(payrollContract).values({
        memberId: staffId,
        organizationId: organizationId,
        payeeType: "staff",
        status: "active",
        monthlyAmount: monthlyAmount,
        createdBy: session.user.id,
        effectiveFrom: format(new Date(), "yyyy-MM-dd"),
        effectiveTo: null,
      })
    })

    revalidatePath(`/org/dashboard/staff/${staffId}`)

    return {
      success: true,
      message: "Salary updated successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong",
    }
  }
})
