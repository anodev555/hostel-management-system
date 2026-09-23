import { getOrgSidebarAuth } from "../lib/get-orgsidebarauth"
import { NavUser } from "./nav-user"

export async function OrgSidebarFooter() {
  const { user } = await getOrgSidebarAuth()

  return <NavUser user={user} />
}
