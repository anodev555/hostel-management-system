"use server"

import { auth } from "@/lib/auth"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { revalidatePath } from "next/cache"

type DeleteRoleInput = {
  roleId: string
}

export const deleteRoleAction = withAuth<DeleteRoleInput, ActionResponse<null>>(
  {
    roles: ["orgUser"],
    permissions: {
      ac: ["delete"],
    },
    requireActiveOrg: true,
  }
)(async ({ data, headers, organizationId }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "No active organization" }
    }

    const { roleId } = data

    const result = await auth.api.deleteOrgRole({
      body: {
        roleId,
        organizationId,
      },
      headers,
    })

    if (!result?.success) {
      return { success: false, message: "Failed to delete role" }
    }

    revalidatePath("/org/dashboard/roles")
    revalidatePath(`/org/dashboard/roles/${roleId}`)

    return {
      success: true,
      message: "Role deleted successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete role",
    }
  }
})
