"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import db from "@/db";
import { organization } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";

import { deleteHostelSchema } from "../schema/hostel-detail-schema";

export const deleteHostelAction = withAuth<
  z.infer<typeof deleteHostelSchema>,
  ActionResponse<null>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<null>> => {
  try {
    const parsed = deleteHostelSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const { hostelId } = parsed.data;

    const existing = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.id, hostelId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: "Hostel not found" };
    }

    await db.delete(organization).where(eq(organization.id, hostelId));

    revalidatePath("/admin/dashboard/hostels");
    return { success: true, message: "Hostel deleted permanently", data: null };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete hostel" };
  }
});