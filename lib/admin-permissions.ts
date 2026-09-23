import { createAccessControl } from "better-auth/plugins"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

const statement = {
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

//super admin- full platfor, control
export const superAdminRole = ac.newRole({
  ...adminAc.statements,
})

// export const orgAdminRole = ac.newRole({
//   user: [
//     "create",
//     "list",
//     "set-role",
//     "ban",
//     "impersonate",
//     "impersonate-admins",
//     "delete",
//     "set-password",
//     "set-email",
//     "get",
//     "update",
//   ],
//   session: ["revoke"],
// })

export const orgUserRole = ac.newRole({
  user: ["create", "set-password"],

  session: ["revoke"],
})
