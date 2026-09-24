'use server'
import db from "@/db";
import { member, user } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
 export type updateStaffStatusProps = {
  status:boolean;
  staffId:string;
}


 export const updateStaffStatusAction = withAuth<
  updateStaffStatusProps,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    staff: ["update"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please relogi again",
      };
    }
    const memberId = data.staffId;

    const memberRow = await db
      .select({
        userId: member.userId,
        organizationId: member.organizationId,
      })
      .from(member)
      .where(
        and(eq(member.id, memberId), eq(member.organizationId, organizationId)),
      )
      .limit(1); 
      
      if (!memberRow[0]) {
      return {
        success: false,
        message: "Staff not found!",
      };
    }

    if (memberRow[0].userId === session?.user.id) {
      return {
        success: false,
        message: "You can't deactivate your own account!",
      };
    }

   

  await db.update(user).set({
    isActive:data.status
  }).where(
    and(
        eq(
            user.id,
            memberRow[0].userId
        ),
       
    )
  )

    revalidatePath("org/dashboard/staff");
    return {
      success: true,
      message: "Status updated successfully",
      data: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to update status"}`,
    };
  }
});
