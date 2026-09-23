"use server"

import { withAuth } from "@/lib/withAuth"
import {
  createOrgSchema,
  CreateOrgSchemaType,
  createOrgWithExistingUserSchema,
  CreateOrgWithExistingUserSchemaType,
} from "../schema/organizationSchema"
import z from "zod"
import { auth } from "@/lib/auth"
import { slugify } from "@/utils/slugify"
import db from "@/db"
import { eq } from "drizzle-orm"
import { user } from "@/db/schema"

type createOrganizationResponse = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

export const createOrganizationAction = withAuth<
  CreateOrgSchemaType,
  createOrganizationResponse
>({
  roles: ["superAdmin"],
  adminPermissions: {
    user: ["create", "set-role"],
  },
})(async ({ data, headers }): Promise<createOrganizationResponse> => {
  const parsed = createOrgSchema.safeParse(data)
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error)

    return {
      success: false,
      message: "Invalid input",
      fieldErrors: fieldErrors as Record<string, string[]>,
    }
  }
  let createdUserId: string | undefined
  try {
    const newUser = await auth.api.createUser({
      body: {
        email: parsed.data.ownerEmail,
        name: parsed.data.ownerFullName,
        role: "orgAdmin",
        password: parsed.data.ownerPassword,
        data: {
          contactPhone: parsed.data.ownerPhone,
          username: parsed.data.ownerUsername,
          displayUsername: parsed.data.ownerFullName,
        },
      },
      headers,
    })
    createdUserId = newUser.user.id
    const orgSlug = slugify(parsed.data.orgName)
    const data = await auth.api.checkOrganizationSlug({
      body: {
        slug: orgSlug,
      },
      headers,
    })
    if (!data.status) {
      return {
        success: false,
        message: "Organization name already exists",
      }
    }

    const newOrganization = await auth.api.createOrganization({
      body: {
        name: parsed.data.orgName,
        slug: orgSlug,
        userId: newUser.user.id,
        location: parsed.data.location,
      },
    })

    return {
      success: true,
      message: `Organization ${newOrganization.name} created successfully for user ${newUser.user.name}`,
    }
  } catch (error) {
    console.error(error)
    if (createdUserId) {
      await auth.api
        .removeUser({
          body: {
            userId: createdUserId,
          },
          headers,
        })
        .catch((error) => {
          console.error(
            `RollBack Error: falied to remove user ${createdUserId} | ${error instanceof Error ? error.message : "Unknown error"}`
          )
        })
    }
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Unknown error"}`,
      fieldErrors: {},
    }
  }
})

export const createOrganizationWithExistingUserAction = withAuth<
  CreateOrgWithExistingUserSchemaType,
  createOrganizationResponse
>({
  roles: ["superAdmin"],
  adminPermissions: {
    user: ["create", "set-role"],
  },
})(async ({ data, headers }): Promise<createOrganizationResponse> => {
  try {
    const parsed = createOrgWithExistingUserSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid input",
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    const isUserExists = await db.query.user.findFirst({
      where: eq(user.username, parsed.data.ownerUsername),
    })

    if (!isUserExists?.id) {
      return {
        success: false,
        message: "User not found with username: " + parsed.data.ownerUsername,
      }
    }

    if (isUserExists.role !== "orgAdmin") {
      return {
        success: false,
        message:
          "User is not an organization admin! Cannot assign Organization",
      }
    }

    const orgSlug = slugify(parsed.data.orgName)
    const isOrgSlugExists = await auth.api.checkOrganizationSlug({
      body: {
        slug: orgSlug,
      },
      headers,
    })
    if (!isOrgSlugExists.status) {
      return {
        success: false,
        message: "Organization name already exists",
      }
    }

    const newOrganization = await auth.api.createOrganization({
      body: {
        name: parsed.data.orgName,
        slug: orgSlug,
        userId: isUserExists.id,
        location: parsed.data.location,
      },
    })

    return {
      success: true,
      message: `Organization ${newOrganization.name} created successfully for user ${isUserExists.name}`,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Unknown error"}`,
      fieldErrors: {},
    }
  }
})
