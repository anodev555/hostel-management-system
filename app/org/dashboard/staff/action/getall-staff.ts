"use server"

import db from "@/db"
import { member, user } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { StaffItem } from "@/types/staff-type"
import { and, eq, or, ilike, ne } from "drizzle-orm"
import { desc } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"
interface getAllRolesActionProps {
  search?: string
}

export const getAllStaffAction = withAuth<
  getAllRolesActionProps,
  ActionResponse<StaffItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["read"],
  },
})(async ({ data, organizationId }): Promise<ActionResponse<StaffItem[]>> => {
  if (!organizationId) {
    return {
      success: false,
      message:
        "Organization not found! Please logout and login again to continue",
    }
  }

  try {
    const search = data?.search?.trim() || ""
    const staffs = await db
      .select({
        id: member.id,
        createdAt: member.createdAt,
        staffName: user.name,
        staffUsername: user.username,
        staffRole: member.role,
        staffPhone: user.contactPhone,
        staffImage: user.image,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
      .where(
        search
          ? and(
            eq(member.organizationId, organizationId),
            or(
              ilike(user.username, `%${search}%`),
              ilike(user.email, `%${search}%`)
            )
          )
          : and(
            eq(member.organizationId, organizationId),
            ne(member.role, "owner")
          )
      )
      .orderBy(desc(member.createdAt))
    return {
      success: true,
      data: staffs,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch staffs",
    }
  }
})
