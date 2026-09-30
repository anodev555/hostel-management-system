/**
 * Seed the platform super-admin user (better-auth + username plugin).
 *
 * Run:  npm run seed:superadmin
 * Env:  SUPERADMIN_EMAIL, SUPERADMIN_USERNAME (8-15 chars),
 *       SUPERADMIN_PASSWORD (min 8 chars), SUPERADMIN_NAME (optional),
 *       SUPERADMIN_PHONE (optional). DATABASE_URL must be set.
 *
 * Idempotent: if a user with the same username or email exists, it is
 * promoted to superAdmin, re-activated, and its password is reset.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq, or } from "drizzle-orm";

import db from "@/db";
import { account, user } from "@/db/schema/auth-schema";

const email = process.env.SUPERADMIN_EMAIL;
const username = process.env.SUPERADMIN_USERNAME;
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME;
const contactPhone = process.env.SUPERADMIN_PHONE;

function fail(message: string): never {
  console.error(`[seed:superadmin] ${message}`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");
if (username.length < 8 || username.length > 15) {
  fail(
    `SUPERADMIN_USERNAME must be 8-15 characters (username plugin limits), got ${username.length}.`,
  );
}
if (password.length < 8)
  fail("SUPERADMIN_PASSWORD must be at least 8 characters.");

async function main() {
  const existing = await db.query.user.findFirst({
    where: or(eq(user.username, username), eq(user.email, email)),
  });

  const passwordHash = await hashPassword(password);
  const now = new Date();

  if (existing) {
    await db
      .update(user)
      .set({
        name,
        email,
        username,
        displayUsername: name,
        role: "superAdmin",
        isActive: true,
        banned: false,
        contactPhone,
        updatedAt: now,
      })
      .where(eq(user.id, existing.id));

    const existingAccount = await db.query.account.findFirst({
      where: or(
        eq(account.userId, existing.id),
        eq(account.accountId, existing.id),
      ),
    });

    if (existingAccount) {
      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: now })
        .where(eq(account.id, existingAccount.id));
    } else {
      await db.insert(account).values({
        id: randomUUID(),
        accountId: existing.id,
        providerId: "credential",
        userId: existing.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(
      `[seed:superadmin] Updated existing user "${username}" (${email}) -> role=superAdmin, isActive=true.`,
    );
    return;
  }

  const userId = randomUUID();
  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: false,
    role: "superAdmin",
    username,
    displayUsername: name,
    contactPhone,
    isActive: true,
    banned: false,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  console.log(
    `[seed:superadmin] Created superAdmin "${username}" (${email}). Log in with username + password.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      `[seed:superadmin] Failed: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  });
