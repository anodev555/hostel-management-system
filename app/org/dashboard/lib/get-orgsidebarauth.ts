import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getDashboardForRole } from "@/lib/get-dashboard-for-role"
import { Org } from "@/types/org-type"

export const getOrgSidebarAuth = cache(async () => {
  const requestHeaders = await headers()

  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "orgUser") {
    redirect(getDashboardForRole(session.user.role) ?? "/login")
  }

  const organizations = (await auth.api.listOrganizations({
    headers: requestHeaders,
  })) as Org[]

  const activeOrganizationId = session.session.activeOrganizationId ?? null

  const currentActiveOrganization =
    organizations.find((org) => org.id === activeOrganizationId) ?? null

  const user = {
    name:
      session.user.displayUsername ??
      session.user.username ??
      session.user.name ??
      "",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
    role: session.user.role ?? "",
  }

  return {
    user,
    organizations,
    currentActiveOrganization,
  }
})
