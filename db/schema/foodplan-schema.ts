import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"
export const FoodPlanStatus = pgEnum("food_plan_status", ["active", "inactive"])
export const foodplan = pgTable(
  "food_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    monthlyPrice: decimal("monthly_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: FoodPlanStatus("status").notNull().default("active"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("foodplan_unique_organization_id_name").on(
      table.organizationId,
      table.name
    ),
    index("foodplan_index_organization_id").on(
      table.organizationId,
      table.status
    ),
  ]
)

export type FoodPlan = typeof foodplan.$inferSelect
