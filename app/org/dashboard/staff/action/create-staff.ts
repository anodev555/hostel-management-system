"use server"

import { and, desc, eq } from "drizzle-orm"
import z from "zod"

import db from "@/db"
import { organizationRole, user } from "@/db/schema/auth-schema"
import { auth } from "@/lib/auth"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import {
  createStaffSchema,
  type CreateStaffSchemaType,
} from "../schema/createStaff"
import { revalidatePath, updateTag } from "next/cache"
import { payrollContract } from "@/db/schema"
import { format } from "date-fns"

export const createStaffAction = withAuth<
  CreateStaffSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  adminPermissions: {
    user: ["create"],
  },
  permissions: {
    staff: ["create"],
  },
})(async ({
  data,
  headers,
  organizationId,
  session,
}): Promise<ActionResponse<null>> => {
  let userId: string | undefined
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please logout and try again",
      }
    }
    const parsed = createStaffSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors,
      }
    }
    //checking if role is valid or not
    const role = await db.query.organizationRole.findFirst({
      where: and(
        eq(organizationRole.organizationId, organizationId),
        eq(organizationRole.role, parsed.data.role.toLowerCase())
      ),
    })
    if (!role?.id) {
      return {
        success: false,
        message: "Role not found! Please check the role and try again",
      }
    }
    //checking if username is already taken
    const isUsernameTaken = await db.query.user.findFirst({
      where: eq(user.username, parsed.data.username),
    })
    if (isUsernameTaken?.id) {
      return {
        success: false,
        message: "Username already taken! Please choose a different username",
      }
    }
    //creating new staff user
    const newUser = await auth.api.createUser({
      body: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: parsed.data.password,
        data: {
          contactPhone: parsed.data.contactPhone,
          username: parsed.data.username,
          displayUsername: parsed.data.name,
        },
      },
      headers,
    })
    userId = newUser.user.id

    //create a memebership for the new staff user in the organization
    const membership = await auth.api.addMember({
      body: {
        userId: userId,
        role: parsed.data.role.toLowerCase(), // required
        organizationId: organizationId,
      } as NonNullable<Parameters<typeof auth.api.addMember>[0]>["body"],
      headers,
    })

    if (!membership.id) {
      if (userId) {
        await auth.api.removeUser({
          body: { userId: userId },
          headers,
        })
      }
      return {
        success: false,
        message: "Failed to create membership for the new staff user",
      }
    }
    //create a payroll contract for the new staff user
    try {
      await db.insert(payrollContract).values({
        organizationId: organizationId,
        payeeType: "staff",
        effectiveFrom: format(new Date(), "yyyy-MM-dd"),
        monthlyAmount: parsed.data.salary,
        memberId: membership.id,
        status: "active",
        createdBy: session?.user?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (payrollcontractError) {
      await auth.api.removeUser({
        body: { userId: userId },
        headers,
      })
      throw new Error(
        payrollcontractError instanceof Error
          ? payrollcontractError.message
          : "Failed to create payroll contract for the new staff user"
      )
    }
    revalidatePath("/org/dashboard/staff")
    return {
      success: true,
      message: `Staff ${newUser.user.name} created successfully with role ${data.role}`,
      data: null,
    }
  } catch (error) {
    console.error(error)
    if (userId) {
      await auth.api.removeUser({
        body: { userId: userId },
        headers,
      })
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create staff user",
    }
  }
})
