"use server"

import { ActionResponse } from "@/types/action-response"
import {
  staffProfileSchema,
  StaffProfileSchemaType,
} from "../schema/staffProfile"
import { withAuth } from "@/lib/withAuth"
import z from "zod"
import db from "@/db"
import { member, organizationRole, user } from "@/db/schema"
import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const updateStaffProfileAction = withAuth<
  StaffProfileSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  try {
    const parsedData = staffProfileSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors,
      }
    }

    //checking if role is valid or not
    const checkRole = await db.query.organizationRole.findFirst({
      where: and(
        eq(organizationRole.organizationId, organizationId as string),
        eq(organizationRole.role, parsedData.data.role.toLowerCase())
      ),
    })

    if (!checkRole?.id) {
      return {
        success: false,
        message: "Role not found! Please check the role and try again",
      }
    }
    //checking if username is available or not
    const username = await db.query.user.findFirst({
      where: and(
        eq(user.username, parsedData.data.username),
        ne(user.id, parsedData.data.userId)
      ),
    })

    if (username?.id) {
      return {
        success: false,
        message:
          "Username is already taken! Please choose a different username",
      }
    }

    //update user profile
    await db
      .update(user)
      .set({
        name: parsedData.data.name,
        email: parsedData.data.email,
        username: parsedData.data.username,
        contactPhone: parsedData.data.contactPhone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, parsedData.data.userId))

    //update member org staff profile

    await db
      .update(member)
      .set({
        role: parsedData.data.role.toLowerCase(),
      })
      .where(
        and(
          eq(member.userId, parsedData.data.userId),
          eq(member.organizationId, organizationId as string)
        )
      )
    revalidatePath(`/org/dashboard/staff/${parsedData.data.userId}`)

    return {
      success: true,
      message: "Profile updated successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to update staff profile",
    }
  }
})
