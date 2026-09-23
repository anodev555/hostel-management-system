"use server"

import { withAuth } from "@/lib/withAuth"
import { z } from "zod"
import {
  staffSecuritySchema,
  StaffSecuritySchemaType,
} from "../schema/staffSecurity"
import { ActionResponse } from "@/types/action-response"
import db from "@/db"
import { and, eq } from "drizzle-orm"
import { member } from "@/db/schema"
import { auth } from "@/lib/auth"

export const staffResetPasswordAction = withAuth<
  StaffSecuritySchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  adminPermissions: {
    user: ["set-password"],
    session: ["revoke"],
  },
  permissions: {
    staff: ["update"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
  headers,
}): Promise<ActionResponse<null>> => {
  try {
    //validating data
    const parsed = staffSecuritySchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors,
      }
    }

    const targetUser = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId as string),
        eq(member.id, parsed.data.staffId)
      ),
    })

    if (!targetUser?.userId) {
      return {
        success: false,
        message: "Staff not found",
      }
    }
    const targetUserId = targetUser.userId

    await auth.api.setUserPassword({
      body: {
        newPassword: parsed.data.password,
        userId: targetUserId, // required
      },

      headers: headers,
    })

    await auth.api.revokeUserSessions({
      body: {
        userId: targetUserId,
      },
      headers: headers,
    })

    return {
      success: true,
      message: "Password reset successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong. Can't Reset Password",
    }
  }
})
