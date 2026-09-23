import {
  adminClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { ac, orgUserRole, superAdminRole } from "./admin-permissions"
import { orgAc } from "./org-permissions"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,

  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: {
        superAdmin: superAdminRole,
        orgUser: orgUserRole,
      },
    }),
    inferAdditionalFields({
      user: {
        contactPhone: { type: "string" },
      },
    }),
    organizationClient({
      ac: orgAc,
      dynamicAccessControl: {
        enabled: true,
      },
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
            location: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        organizationRole: {
          additionalFields: {
            createdBy: { type: "string" },
          },
        },
      }),
    }),
  ],
})
