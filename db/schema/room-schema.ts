import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"
import { sql } from "drizzle-orm"

export const lodgingPlan = pgTable(
  "lodging_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    monthlyPrice: decimal("monthly_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    status: text("status").notNull().default("active"),
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
    uniqueIndex("lodging_plan_unique_organization_id_name").on(
      table.organizationId,
      table.name
    ),
    index("lodging_plan_index_organization_id").on(
      table.organizationId,
      table.status
    ),
  ]
)

export const room = pgTable(
  "room",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomNumber: integer("room_number").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    floor: integer("floor").notNull(),
    fans: integer("fans").notNull().default(0),

    totalBeds: integer("total_beds").notNull(),
    attachedBathroom: boolean("attached_bathroom").notNull().default(false),
    airConditioner: boolean("air_conditioner").notNull().default(false),

    lodgingPlanId: uuid("lodging_plan_id")
      .notNull()
      .references(() => lodgingPlan.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    status: text("status").notNull().default("active"),
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
    uniqueIndex("room_unique_organization_id_room_number").on(
      table.organizationId,
      table.roomNumber
    ),
    check("room_total_beds_positive", sql`${table.totalBeds} >= 1`),
    index("room_index_organization_id").on(table.organizationId, table.status),
  ]
)

export type Room = typeof room.$inferSelect
