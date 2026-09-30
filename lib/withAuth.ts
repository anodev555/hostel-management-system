import { headers } from "next/headers"

import type { RoleType } from "@/db/schema"
import db from "@/db"
import { organization, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { ORG_INACTIVE_MESSAGE, USER_INACTIVE_MESSAGE } from "./auth-messages"

/** Logged-in session from Better Auth (non-null). */
export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>

/** Org-level permission map, e.g. `{ student: ["read", "create"] }`. */
export type OrgPermissions = Record<string, string[]>

/** Platform admin permission map, e.g. `{ user: ["create"] }`. */
export type AdminPermissions = Record<string, string[]>

export class AuthActionError extends Error {
  readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "BAD_REQUEST"

  constructor(
    message: string,
    code: "UNAUTHORIZED" | "FORBIDDEN" | "BAD_REQUEST"
  ) {
    super(message)
    this.name = "AuthActionError"
    this.code = code
  }
}

export function isAuthActionError(error: unknown): error is AuthActionError {
  return error instanceof AuthActionError
}

export type WithAuthOptions = {
  /** Platform roles allowed to call this action (`user.role`). */
  roles?: RoleType[]
  /**
   * Org-level permissions (member role + orgAc). Requires organization context.
   * All listed resource permissions must pass (AND).
   */
  permissions?: OrgPermissions
  /**
   * Alternative org permission sets (OR). Passes if the user satisfies at least
   * one set. Each set still uses AND across its resources (Better Auth default).
   */
  permissionsAny?: OrgPermissions[]
  /** Platform admin permissions (admin plugin). Checked against the current user. */
  adminPermissions?: AdminPermissions
  /** Require `session.session.activeOrganizationId` before running. */
  requireActiveOrg?: boolean
}

export async function assertOrgPermissions(
  requestHeaders: Headers,
  organizationId: string,
  options: Pick<WithAuthOptions, "permissions" | "permissionsAny">
): Promise<boolean> {
  if (options.permissions) {
    const permissionResult = await auth.api.hasPermission({
      headers: requestHeaders,
      body: {
        permissions: options.permissions,
        organizationId,
      },
    })

    if (!permissionResult?.success) {
      return false
    }
  }

  if (options.permissionsAny?.length) {
    const results = await Promise.all(
      options.permissionsAny.map((permSet) =>
        auth.api.hasPermission({
          headers: requestHeaders,
          body: {
            permissions: permSet,
            organizationId,
          },
        })
      )
    )

    if (!results.some((result) => result?.success)) {
      return false
    }
  }

  return true
}

export type AuthContext<TInput> = {
  session: AuthSession
  data: TInput
  organizationId: string | null
  headers: Headers
}

/**
 * Wraps a server action with session, role, and permission checks.
 * Validation is handled by the caller — pass `TInput` for typed action input.
 *
 * @example
 * export const createHostel = withAuth<CreateOrgSchemaType>({
 *   roles: ["superAdmin"],
 * })(async ({ session, data }) => {
 *   const parsed = createOrgSchema.parse(data)
 *   // business logic
 * })
 */
export function withAuth<TInput, TOutput>(options: WithAuthOptions) {
  return function (handler: (ctx: AuthContext<TInput>) => Promise<TOutput>) {
    return async (data: TInput): Promise<TOutput> => {
      const requestHeaders = await headers()

      const session = await auth.api.getSession({
        headers: requestHeaders,
      })

      if (!session) {
        throw new AuthActionError("Not authenticated", "UNAUTHORIZED")
      }

      // Kick users deactivated after login.
      const freshUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
        columns: { isActive: true },
      })
      if (freshUser?.isActive === false) {
        throw new AuthActionError(USER_INACTIVE_MESSAGE, "FORBIDDEN")
      }

      const role = session.user.role as RoleType

      if (options.roles && !options.roles.includes(role)) {
        throw new AuthActionError("Insufficient role", "FORBIDDEN")
      }

      const organizationId = session.session.activeOrganizationId ?? null

      // Kick members whose active organization was deactivated after login.
      // superAdmin has no single org, so only check orgUsers with an active org.
      if (organizationId && role !== "superAdmin") {
        const activeOrg = await db.query.organization.findFirst({
          where: eq(organization.id, organizationId),
          columns: { isActive: true },
        })
        if (activeOrg && activeOrg.isActive === false) {
          throw new AuthActionError(ORG_INACTIVE_MESSAGE, "FORBIDDEN")
        }
      }

      if (options.requireActiveOrg && !organizationId) {
        throw new AuthActionError(
          "No active organization selected",
          "BAD_REQUEST"
        )
      }

      if (options.adminPermissions) {
        const adminPermissionResult = await auth.api.userHasPermission({
          headers: requestHeaders,
          body: {
            permissions: options.adminPermissions,
          },
        })

        if (!adminPermissionResult?.success) {
          throw new AuthActionError("Insufficient permissions", "FORBIDDEN")
        }
      }

      if (options.permissions || options.permissionsAny?.length) {
        if (!organizationId) {
          throw new AuthActionError(
            "Organization context required",
            "BAD_REQUEST"
          )
        }

        const allowed = await assertOrgPermissions(
          requestHeaders,
          organizationId,
          {
            permissions: options.permissions,
            permissionsAny: options.permissionsAny,
          }
        )

        if (!allowed) {
          throw new AuthActionError("Insufficient permissions", "FORBIDDEN")
        }
      }

      return handler({
        session,
        data,
        organizationId,
        headers: requestHeaders,
      })
    }
  }
}
