"use server"

import db from "@/db"
import { member, user } from "@/db/schema"
import { payrollContract } from "@/db/schema/payroll-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { StaffData, StaffDetail } from "@/types/staff-type"
import { eq, and, desc } from "drizzle-orm"
type GetStaffDetailProps = {
  staffId: string
}

export const getStaffDetailAction = withAuth<
  GetStaffDetailProps,
  ActionResponse<StaffData>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["read"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<StaffData>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }
    const staffId = data.staffId
    if (!staffId) {
      return {
        success: false,
        message: "Staff id is required",
      }
    }
    const [staffDetail] = await db
      .select({
        id: member.id,
        createdAt: member.createdAt,
        userId: member.userId,
        staffId: member.id,
        name: user.name,
        username: user.username,
        role: member.role,
        email: user.email,
        phone: user.contactPhone,
        displayUsername: user.displayUsername,
        image: user.image,
        salary: payrollContract.monthlyAmount,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
      .leftJoin(
        payrollContract,
        and(
          eq(member.id, payrollContract.memberId),
          eq(payrollContract.payeeType, "staff"),
          eq(payrollContract.organizationId, organizationId as string),
          eq(payrollContract.status, "active")
        )
      )
      .where(
        and(
          eq(member.id, staffId),
          eq(member.organizationId, organizationId as string)
        )
      )

    if (!staffDetail) {
      return {
        success: false,
        message: "Staff not found",
      }
    }

    // get salary contract
    const salaryContract = await db
      .select({
        id: payrollContract.id,
        monthlyAmount: payrollContract.monthlyAmount,
        effectiveFrom: payrollContract.effectiveFrom,
        effectiveTo: payrollContract.effectiveTo,
        status: payrollContract.status,
      })
      .from(payrollContract)
      .where(
        and(
          eq(payrollContract.memberId, staffId),
          eq(payrollContract.organizationId, organizationId as string),
          eq(payrollContract.payeeType, "staff")
        )
      )
      .orderBy(desc(payrollContract.createdAt))

    return {
      success: true,
      data: {
        staffDetail: staffDetail,
        salaryHistory: salaryContract,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to get staff detail",
    }
  }
})
