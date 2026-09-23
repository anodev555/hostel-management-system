"use server"

import db from "@/db"
import { organizationRole, user } from "@/db/schema/auth-schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { RoleItem } from "@/types/role/roles-type"
import { and, eq, like } from "drizzle-orm"
interface GetAllRolesProps {
  search?: string
}
export const getAllRolesAction = withAuth<
  GetAllRolesProps,
  ActionResponse<RoleItem[]>
>({
  roles: ["orgUser"],
  permissions: {
    ac: ["read"],
  },
})(async ({
  data,

  organizationId,
}): Promise<ActionResponse<RoleItem[]>> => {
  try {
    const search = data?.search
    if (!organizationId) {
      return {
        success: false,
        message: "No Active Organization! Please logout and login again",
      }
    }
    //query the roles from the database

    const roles = await db
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
        search
          ? and(
            eq(organizationRole.organizationId, organizationId),
            like(organizationRole.role, `%${search}%`)
          )
          : eq(organizationRole.organizationId, organizationId)
      )

    return {
      success: true,
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
