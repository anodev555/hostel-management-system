"use server"

import db from "@/db"
import { organizationRole, user } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { RoleItem } from "@/types/role/roles-type"
import { eq, and } from "drizzle-orm"
type getRoleDetailProps = {
  roleId: string
}
export const getRoleDetailAction = withAuth<
  getRoleDetailProps,
  ActionResponse<RoleItem>
>({
  roles: ["orgUser"],
  permissions: {
    ac: ["read"],
  },
})(async ({ data, organizationId }): Promise<ActionResponse<RoleItem>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "No Active Organization! Please logout and login again",
      }
    }

    const { roleId } = data
    const [roleDetail] = await db
      .select({
        id: organizationRole.id,
        organizationId: organizationRole.organizationId,
        role: organizationRole.role,
        permission: organizationRole.permission,
        createdAt: organizationRole.createdAt,
        updatedAt: organizationRole.updatedAt,
        createdBy: organizationRole.createdBy,
        createdByUsername: user.username,
      })
      .from(organizationRole)
      .leftJoin(user, eq(organizationRole.createdBy, user.id))
      .where(
        and(
          eq(organizationRole.id, roleId),
          eq(organizationRole.organizationId, organizationId)
        )
      )

    if (!roleDetail) {
      return {
        success: false,
        message: "Role not found",
      }
    }

    return {
      success: true,
      data: roleDetail,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to get role detail",
    }
  }
})
