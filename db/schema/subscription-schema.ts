import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";

export const subscriptionPlan = pgTable(
  "subscription_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),

    price: decimal("price", {
      precision: 10,
      scale: 2,
    }),
    maxStudents: integer("max_students"),
    maxStaff: integer("max_staff"),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("subscription_plan_unique_name").on(table.name),
    index("subscription_plan_index_is_active").on(table.isActive),
    check(
      "subscription_plan_monthly_price_non_negative",
      sql`${table.price} IS NULL OR ${table.price} >= 0`,
    ),

    check(
      "subscription_plan_max_students_positive",
      sql`${table.maxStudents} IS NULL OR ${table.maxStudents} >= 1`,
    ),
    check(
      "subscription_plan_max_staff_positive",
      sql`${table.maxStaff} IS NULL OR ${table.maxStaff} >= 1`,
    ),
  ],
);

export const organizationSubscriptionStatus = pgEnum(
  "organization_subscription_status",
  ["active", "past_due", "cancelled"],
);

export const organizationSubscription = pgTable(
  "organization_subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => subscriptionPlan.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    status: organizationSubscriptionStatus("status")
      .notNull()
      .default("active"),
    planName: text("plan_name").notNull(),
    priceAtSignup: decimal("price_at_signup", {
      precision: 10,
      scale: 2,
    }).notNull(),
    maxStudentsSnapshot: integer("max_students_snapshot"),
    maxStaffSnapshot: integer("max_staff_snapshot"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    nextBillingDate: date("next_billing_date").notNull(),
    cancelledAt: timestamp("cancelled_at"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("organization_subscription_unique_active_org")
      .on(table.organizationId)
      .where(sql`${table.status} = 'active'`),
    index("organization_subscription_index_org_status").on(
      table.organizationId,
      table.status,
    ),
    index("organization_subscription_index_plan").on(table.planId),
    index("organization_subscription_index_next_billing").on(
      table.status,
      table.nextBillingDate,
    ),
    check(
      "organization_subscription_price_non_negative",
      sql`${table.priceAtSignup} >= 0`,
    ),
  ],
);

export const subscriptionPlanRelations = relations(
  subscriptionPlan,
  ({ many }) => ({
    subscriptions: many(organizationSubscription),
  }),
);

export const organizationSubscriptionRelations = relations(
  organizationSubscription,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationSubscription.organizationId],
      references: [organization.id],
    }),
    plan: one(subscriptionPlan, {
      fields: [organizationSubscription.planId],
      references: [subscriptionPlan.id],
    }),
  }),
);

export type SubscriptionPlan = typeof subscriptionPlan.$inferSelect;
export type OrganizationSubscription =
  typeof organizationSubscription.$inferSelect;
