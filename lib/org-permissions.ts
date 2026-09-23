import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements } from "better-auth/plugins/organization/access"
import { ownerAc } from "better-auth/plugins/organization/access"

export const orgPermissions = {
  student: ["create", "read", "update", "delete","collectpayment","checkout"],
  room: ["create", "read", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  staff: ["create", "read", "update", "delete"],
  lodging: ["create", "read", "update", "delete"],
  food: ["create", "read", "update", "delete"],
  tuition: ["create", "read", "update", "delete"],
  organization: ["read", "update"],
  invoice: ["read"],
  payment: ["read","edit","update","delete"],
  billing: ["read"],
  expenses: ["create", "read", "update", "delete"],
}

const statement = {
  ...defaultStatements,
  ...orgPermissions,
} as const

export const orgAc = createAccessControl(statement)

export const ownerRole = orgAc.newRole({
  ...ownerAc.statements,
  ...orgPermissions,
})
