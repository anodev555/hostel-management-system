"use server"

import { withAuth } from "@/lib/withAuth"
import {
  orgProfileLogoSchema,
  OrgProfileLogoType,
  orgProfileSchema,
  OrgProfileType,
} from "../schema/orgprofile"
import { ActionResponse } from "@/types/action-response"
import { uploadImage, UploadValidationError } from "@/utils/upload-file"
import z from "zod"
import db from "@/db"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { deleteFile } from "@/utils/delete-file"
import { revalidatePath } from "next/cache"
import { OrganizationProfileType } from "@/types/organization-type"

const MAX_IMAGE_SIZE = 1024 * 1024 * 5 // 5MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"]

export const uploadOrgProfileLogo = withAuth<
  OrgProfileLogoType,
  ActionResponse<{ logo: string }>
>({
  roles: ["orgUser"],
  permissions: {
    organization: ["update"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<{ logo: string }>> => {
  if (!organizationId)
    return { success: false, message: "Organization not found" }

  let uploadedLogoPath: string | undefined

  try {
    const parsedData = orgProfileLogoSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const [orgRow] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1)

    if (!orgRow)
      return {
        success: false,
        message: "Organization not found",
      }

    const { relativePath } = await uploadImage(
      parsedData.data.orgProfileLogo,
      "public/uploads/organization-logos",
      {
        maxSizeBytes: MAX_IMAGE_SIZE,
        allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      }
    )

    uploadedLogoPath = relativePath

    const [updated] = await db
      .update(organization)
      .set({ logo: relativePath })
      .where(eq(organization.id, organizationId))
      .returning({ id: organization.id })

    if (!updated) {
      if (uploadedLogoPath) {
        await deleteFile(uploadedLogoPath).catch(console.error)
      }
      return { success: false, message: "Failed to update organization" }
    }

    if (uploadedLogoPath && orgRow.logo && orgRow.logo !== uploadedLogoPath) {
      await deleteFile(orgRow.logo).catch(console.error)
    }

    revalidatePath("/org/dashboard/setting")
    revalidatePath("/org/dashboard")

    return {
      success: true,
      message: "Logo updated!",
      data: { logo: relativePath },
    }
  } catch (error) {
    console.error(error)
    if (uploadedLogoPath) {
      await deleteFile(uploadedLogoPath).catch(console.error)
    }
    if (error instanceof UploadValidationError) {
      return {
        success: false,
        message: error.message,
        fieldErrors: { orgProfileLogo: [error.message] },
      }
    }
    return { success: false, message: "Something went wrong!" }
  }
})

export const getOrganizationProfileAction = withAuth<
  void,
  ActionResponse<OrganizationProfileType>
>({
  roles: ["orgUser"],
  permissions: {
    organization: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  organizationId,
}): Promise<ActionResponse<OrganizationProfileType>> => {
  try {
    if (!organizationId)
      return { success: false, message: "Organization not found" }

    const [orgRow] = await db
      .select({
        id: organization.id,
        name: organization.name,
        logo: organization.logo,
        location: organization.location,
        createdAt: organization.createdAt,
      })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1)

    if (!orgRow) return { success: false, message: "Organization not found" }
    return {
      success: true,
      data: orgRow,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong!" }
  }
})

export const updateOrganizationProfileAction = withAuth<
  OrgProfileType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    organization: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId }): Promise<ActionResponse<null>> => {
  if (!organizationId) {
    return { success: false, message: "Organization not found" }
  }

  try {
    const parsedData = orgProfileSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const [updated] = await db
      .update(organization)
      .set({
        name: parsedData.data.name,
        location: parsedData.data.location,
      })
      .where(eq(organization.id, organizationId))
      .returning({ id: organization.id })

    if (!updated) {
      return { success: false, message: "Failed to update organization" }
    }

    revalidatePath("/org/dashboard/setting")
    revalidatePath("/org/dashboard")

    return {
      success: true,
      message: "Organization profile updated!",
      data: null,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong!" }
  }
})
