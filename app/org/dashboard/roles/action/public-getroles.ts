"use server"
import db from "@/db"
import { organizationRole } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { desc, eq, ne, and } from "drizzle-orm"

export type RoleData = {
  id: string
  role: string
}

export const getRolesDataAction = withAuth<void, ActionResponse<RoleData[]>>({
  roles: ["orgUser"],

  requireActiveOrg: true,
})(async ({ organizationId }): Promise<ActionResponse<RoleData[]>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please logout and try again",
      }
    }

    const roles = await db
      .select({
        id: organizationRole.id,
        role: organizationRole.role,
      })
      .from(organizationRole)
      .where(
        and(
          eq(organizationRole.organizationId, organizationId),
          ne(organizationRole.role, "owner")
        )
      )
      .orderBy(desc(organizationRole.createdAt))

    return {
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to fetch roles",
    }
  }
})
