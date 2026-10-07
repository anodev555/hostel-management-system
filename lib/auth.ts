import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, username } from "better-auth/plugins";
import * as schema from "@/db/schema";
import { orgAc, ownerRole } from "./org-permissions";
import { asc, eq } from "drizzle-orm";
import { member, organization as organizationTable } from "@/db/schema";
import { user } from "@/db/schema/auth-schema";
import db from "@/db";
import { ac, orgUserRole, superAdminRole } from "./admin-permissions";
import { ORG_INACTIVE_MESSAGE, USER_INACTIVE_MESSAGE } from "./auth-messages";

async function getInitialOrganization(userId: string) {
  const userdata = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { role: true, isActive: true },
  });
  if (userdata?.isActive === false) {
    throw new APIError("FORBIDDEN", { message: USER_INACTIVE_MESSAGE });
  }

  // Platform admin — no single org
  if (userdata?.role === "superAdmin") return null;
  const memberships = await db
    .select({
      organizationId: member.organizationId,
      organizationIsActive: organizationTable.isActive,
    })
    .from(member)
    .innerJoin(
      organizationTable,
      eq(member.organizationId, organizationTable.id),
    )
    .where(eq(member.userId, userId))
    .orderBy(asc(member.createdAt));
  if (memberships.length === 0) return null;
  const firstActive = memberships.find((m) => m.organizationIsActive !== false);
  if (!firstActive) {
    throw new APIError("FORBIDDEN", { message: ORG_INACTIVE_MESSAGE });
  }
  return { id: firstActive.organizationId };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
  },

  disabledPaths: ["/sign-in/email", "/sign-up/email"], // disable sign in and sign up with email (only allowing with username)
  user: {
    additionalFields: {
      contactPhone: {
        type: "string",
        required: false,
        input: true,
      },
      isActive: {
        type: "boolean",
        required: true,
        input: false,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const initialOrg = await getInitialOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: initialOrg?.id ?? null,
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60 * 24, // 1 day
  },

  plugins: [
    username({
      minUsernameLength: 8,
      maxUsernameLength: 15,
    }),
    admin({
      ac,
      defaultRole: "orgUser", //default role for new users
      roles: {
        superAdmin: superAdminRole,

        orgUser: orgUserRole,
      },
    }),
    organization({
      ac: orgAc,
      roles: {
        owner: ownerRole,
      },
      creatorRole: "owner",
      allowUserToCreateOrganization: false, //only super admin can create organization
      dynamicAccessControl: {
        enabled: true,
      },
      schema: {
        organization: {
          additionalFields: {
            location: {
              type: "string",
              required: false,
              input: true,
            },
            isActive: {
              type: "boolean",
              required: true,
              input: true,
            },
          },
        },
        organizationRole: {
          additionalFields: {
            createdBy: {
              type: "string",
              required: true,
              input: true,
            },
          },
        },
      },
    }),
    nextCookies(),
  ],
});
