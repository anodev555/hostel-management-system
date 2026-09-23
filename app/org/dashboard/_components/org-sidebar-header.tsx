import { getOrgSidebarAuth } from "../lib/get-orgsidebarauth"
import { TeamSwitcher } from "./team-switcher"

export async function OrgSidebarHeader() {
  const { organizations, currentActiveOrganization } = await getOrgSidebarAuth()

  return (
    <TeamSwitcher
      organizations={organizations}
      currentActiveOrganization={currentActiveOrganization}
    />
  )
}
