import db from "@/db";
import { member, organizationRole } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq ,and} from "drizzle-orm";
import { NextResponse } from "next/server";
import {orgPermissions} from "@/lib/org-permissions"
import { headers } from "next/headers";
export async function GET(){

    try{
 const session = await auth.api.getSession({ headers: await headers() })


    if (!session) {
      return NextResponse.json({ permissions: {} }, { status: 401 })
    }

    const activeOrgId = session.session.activeOrganizationId

    if (!activeOrgId) {
      return NextResponse.json({ permissions: {} }, { status: 400 })
    }

    //get memeberRecord

    const [memeberRecord]= await db.select().from(member).where(
        and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, activeOrgId)
        )
    ).limit(1)

    if (!memeberRecord) {
      return NextResponse.json({ permissions: {} })
    }

    //lookup for role

    const [roleRecord] = await db.select().from(organizationRole).where(
        and(
            eq(organizationRole.role, memeberRecord.role),
            eq(organizationRole.organizationId, activeOrgId)
        )
    ).limit(1)
      if (!roleRecord) {
      // "owner" role has no row in organization_role — return all permissions
      if (memeberRecord.role === "owner") {
        return NextResponse.json({ permissions: orgPermissions })
      }
      return NextResponse.json({ permissions: {} })
    }

    const permissions = JSON.parse(roleRecord.permission) as Record<
      string,
      string[]
    >
console.log(permissions)
    return NextResponse.json({ permissions })

    }catch(err){
      console.error("Error fetching permissions:", err)
      return NextResponse.json({ permissions: {} }, { status: 500 })
    }
}