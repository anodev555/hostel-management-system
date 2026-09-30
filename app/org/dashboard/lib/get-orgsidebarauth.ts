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

  // User was deactivated after login — clear session and force re-login.
  const sessionUser = session.user as typeof session.user & {
    isActive?: boolean | null
  }
  if (sessionUser.isActive === false) {
    await auth.api.signOut({ headers: requestHeaders }).catch(() => null)
    redirect("/login?error=user-inactive")
  }

  if (session.user.role !== "orgUser") {
    redirect(getDashboardForRole(session.user.role) ?? "/login")
  }

  const organizations = (await auth.api.listOrganizations({
    headers: requestHeaders,
  })) as (Org & { isActive?: boolean | null })[]

  const activeOrganizationId = session.session.activeOrganizationId ?? null

  const currentActiveOrganization =
    organizations.find((org) => org.id === activeOrganizationId) ?? null

  // Active org was deactivated after login — force re-login (fresh session
  // hook will then surface the ORG_INACTIVE message).
  if (currentActiveOrganization?.isActive === false) {
    await auth.api.signOut({ headers: requestHeaders }).catch(() => null)
    redirect("/login?error=org-inactive")
  }

  const visibleOrganizations = organizations.filter(
    (org) => org.isActive !== false
  )

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
    organizations: visibleOrganizations,
    currentActiveOrganization,
  }
})
