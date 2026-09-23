import type { RoleType } from "@/db/schema"

export function getDashboardForRole(
  role: RoleType | string | undefined | null
): "/admin/dashboard" | "/org/dashboard" | null {
  if (role === "superAdmin") return "/admin/dashboard"
  if (role === "orgUser") return "/org/dashboard"
  return null
}
