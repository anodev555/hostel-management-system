export type RoleItem = {
  id: string
  organizationId: string
  role: string
  permission: string // JSON string from DB
  createdAt: Date
  updatedAt: Date | null
  createdBy: string | null
  createdByUsername: string | null
}
