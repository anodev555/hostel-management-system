import {
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"

export const teacherStatus = pgEnum("teacher_status", ["active", "inactive"])
export const tuitionTeacher = pgTable(
  "tuition_teacher",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    email: text("email"),
    subject: text("subject"),
    address: text("address"),
    phone: text("phone"),
    status: teacherStatus("status").default("active").notNull(),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tuition_teacher_organization_id_idx").on(table.organizationId),
  ]
)

export const tuitionStatus = pgEnum("tuition_status", ["active", "inactive"])

export const tuitionPlan = pgTable(
  "tuition_plan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => tuitionTeacher.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    name: varchar("name", { length: 255 }).notNull(),
    monthlyPrice: decimal("monthly_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: tuitionStatus("status").default("active").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("tuition_plan_org_name_idx").on(
      table.organizationId,
      table.name
    ),
    index("tuition_plan_organization_id_idx").on(
      table.organizationId,
      table.status
    ),
    index("tuition_plan_teacher_id_idx").on(table.teacherId, table.status),
  ]
)

export type TuitionTeacher = typeof tuitionTeacher.$inferSelect
export type TuitionPlan = typeof tuitionPlan.$inferSelect
