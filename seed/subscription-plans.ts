/**
 * Seed the platform subscription plans.
 *
 * Run:  npx tsx seed/subscription-plans.ts
 * Env:  DATABASE_URL must be set.
 *
 * Idempotent: plans are matched by name — existing rows are updated,
 * missing rows are inserted. Prices are in NPR.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";

import db from "@/db";
import { subscriptionPlan } from "@/db/schema/subscription-schema";

const PLANS = [
  {
    name: "Free",
    description: "Trial plan for small hostels getting started.",
    price: "0.00",
    maxStudents: 5,
    maxStaff: 5,
  },
  {
    name: "Basic",
    description: "For small hostels with up to 20 students.",
    price: "999.00",
    maxStudents: 20,
    maxStaff: 20,
  },
  {
    name: "Pro",
    description: "For growing hostels with up to 50 students.",
    price: "2499.00",
    maxStudents: 50,
    maxStaff: 30,
  },
  {
    name: "Enterprise",
    description: "Custom pricing for large hostels. Contact sales.",
    price: null,
    maxStudents: null,
    maxStaff: null,
  },
] as const;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[seed:plans] DATABASE_URL is not set.");
    process.exit(1);
  }

  for (const plan of PLANS) {
    const existing = await db.query.subscriptionPlan.findFirst({
      where: eq(subscriptionPlan.name, plan.name),
    });

    if (existing) {
      await db
        .update(subscriptionPlan)
        .set({
          description: plan.description,
          price: plan.price,
          maxStudents: plan.maxStudents,
          maxStaff: plan.maxStaff,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPlan.id, existing.id));
      console.log(`[seed:plans] Updated "${plan.name}".`);
    } else {
      await db.insert(subscriptionPlan).values({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        maxStudents: plan.maxStudents,
        maxStaff: plan.maxStaff,
        isActive: true,
      });
      console.log(`[seed:plans] Inserted "${plan.name}".`);
    }
  }

  console.log("[seed:plans] Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
