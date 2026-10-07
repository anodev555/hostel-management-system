"use server";

import z from "zod";
import { eq, and } from "drizzle-orm";

import db from "@/db";
import { organization } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import {
  UpdateHostelStatusSchemaType,
  updateHostelStatusSchema,
} from "../schema/organization-schema";

export const updateHostelStatusAction = withAuth<
  UpdateHostelStatusSchemaType,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<null>> => {
  try {
    const parsed = updateHostelStatusSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { hostelId, isActive } = parsed.data;

    const [isHostelExists] = await db
      .select({
        id: organization.id,
      })
      .from(organization)
      .where(and(eq(organization.id, hostelId)))
      .limit(1);

    if (!isHostelExists.id) {
      return {
        success: false,
        message: "Hostel not found",
      };
    }

    const [updated] = await db
      .update(organization)
      .set({ isActive })
      .where(eq(organization.id, isHostelExists.id))
      .returning({ id: organization.id, isActive: organization.isActive });

    if (!updated) {
      return {
        success: false,
        message: "Hostel not found",
      };
    }

    return {
      success: true,
      message: `Hostel marked as ${updated.isActive ? "active" : "inactive"}`,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update hostel status",
    };
  }
});
