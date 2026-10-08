"use server"

import { withAuth } from "@/lib/withAuth"
import { z } from "zod"
import {
  ownerResetPasswordSchema,
  OwnerResetPasswordSchemaType,
} from "../schema/reset-ownerpassword"
import { ActionResponse } from "@/types/action-response"
import db from "@/db"
import { and, eq } from "drizzle-orm"
import { member } from "@/db/schema"
import { auth } from "@/lib/auth"

export const ownerResetPasswordAction = withAuth<
  OwnerResetPasswordSchemaType,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({
  data,
  headers,
}): Promise<ActionResponse<null>> => {
  try {
    const parsed = ownerResetPasswordSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors,
      }
    }

    const targetMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, parsed.data.hostelId),
        eq(member.userId, parsed.data.ownerId),
        eq(member.role, "owner"),
      ),
    })

    if (!targetMember) {
      return {
        success: false,
        message: "Owner not found in this hostel",
      }
    }

    await auth.api.setUserPassword({
      body: {
        newPassword: parsed.data.password,
        userId: parsed.data.ownerId,
      },
      headers: headers,
    })

    await auth.api.revokeUserSessions({
      body: {
        userId: parsed.data.ownerId,
      },
      headers: headers,
    })

    return {
      success: true,
      message: "Owner password reset successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Something went wrong. Can't reset password",
    }
  }
})