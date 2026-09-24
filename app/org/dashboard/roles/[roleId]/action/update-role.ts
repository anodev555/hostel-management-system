"use server"

import { withAuth } from "@/lib/withAuth"
import { EditRoleSchemaType } from "../schema/edit-roleSchema"
import db from "@/db"
import { organizationRole } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { ActionResponse } from "@/types/action-response"
import { revalidatePath } from "next/cache"

export const updateRoleAction = withAuth<
  EditRoleSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    ac: ["update"],
  },
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No active organization" }
    }
    const { roleId, ...values } = data

    const [updatedRole] = await db
      .update(organizationRole)
      .set({
        role: values.name.toLowerCase(),
        permission: JSON.stringify(values.permissions),
      })
      .where(
        and(
          eq(organizationRole.id, roleId),
          eq(organizationRole.organizationId, organizationId)
        )
      )
      .returning({
        name: organizationRole.role,
      })

    if (!updatedRole.name) {
      return {
        success: false,
        message: `Failed to Update Role ${updatedRole.name}`,
      }
    }
    revalidatePath(`/org/dashboard/roles/${roleId}`)

    return {
      success: true,
      message: `Role ${updatedRole.name} updated successfully`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Failed to update role" }
  }
})
