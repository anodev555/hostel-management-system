"use server"

import { auth } from "@/lib/auth"
import { CreateRoleSchemaType, roleSchema } from "../schema/roleSchema"
import { withAuth } from "@/lib/withAuth"
import z from "zod"
import db from "@/db"
import { and, eq } from "drizzle-orm"
import { organizationRole } from "@/db/schema/auth-schema"
import { revalidatePath } from "next/cache"

export type createRoleResponse = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

export const createRoleAction = withAuth<
  CreateRoleSchemaType,
  createRoleResponse
>({
  roles: ["orgUser"],
  permissions: {
    ac: ["create"],
  },
})(async ({
  data,
  headers,
  organizationId,
  session,
}): Promise<createRoleResponse> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please log out and log in again.",
      }
    }

    const parsed = roleSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors,
      }
    }
    //check if role already exists
    const role = await db.query.organizationRole.findFirst({
      where: and(
        eq(organizationRole.organizationId, organizationId ?? ""),
        eq(organizationRole.role, parsed.data.name.toLowerCase())
      ),
    })
    if (role?.id) {
      return {
        success: false,
        message: "Role already exists! Please choose a different name.",
      }
    }
    //create new role
    const { success: createRoleSuccess } = await auth.api.createOrgRole({
      body: {
        role: parsed.data.name.toLowerCase(),
        permission: parsed.data.permissions,
        organizationId: organizationId,
        additionalFields: {
          createdBy: session?.user?.id ?? "",
        },
      },
      headers: headers,
    })

    if (!createRoleSuccess) {
      return {
        success: false,
        message: "Failed to create role",
      }
    }
    revalidatePath("/org/dashboard/roles")

    return {
      success: true,
      message: `${parsed.data.name.toLowerCase()} role created successfully`,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "An unexpected error occurred"}`,
    }
  }
})
