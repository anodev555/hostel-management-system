import {
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { organization, user } from "./auth-schema"
import { student } from "./student-schema"

export const visitors = pgTable(
  "visitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    visitorName: text("visitor_name").notNull(),
    relation: text("relation").notNull(),
    age: integer("age"),
    expectedVisitDuration: text("expected_visit_duration"),
    studentId: uuid("student_id").references(() => student.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    // Snapshot of the student's name at check-in time — survives
    // student renames and deletes.
    studentName: text("student_name").notNull(),
    reason: text("reason").notNull(),
    // Always stamped server-side in the check-in action, never from client.
    checkinAt: timestamp("checkin_at").defaultNow().notNull(),
    // NULL = visitor is still inside. Set once by the checkout action.
    checkoutAt: timestamp("checkout_at"),
    // Date parts derived server-side from checkinAt for fast filtering
    // (same pattern as expenses).
    visitDate: date("visit_date").notNull(),
    visitYear: integer("visit_year").notNull(),
    visitMonth: integer("visit_month").notNull(),
    visitDayOfMonth: integer("visit_day_of_month").notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    checkoutBy: text("checkout_by").references(() => user.id, {
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
    index("idx_visitor_org_date").on(table.organizationId, table.visitDate),
    index("idx_visitor_org_month_year").on(
      table.organizationId,
      table.visitYear,
      table.visitMonth
    ),
    index("idx_visitor_org_student").on(table.organizationId, table.studentId),
    index("idx_visitor_org_checkout").on(table.organizationId, table.checkoutAt),
    check("visitor_age_valid", sql`${table.age} IS NULL OR ${table.age} >= 0`),
    check(
      "visitor_month_valid",
      sql`${table.visitMonth} >= 1 AND ${table.visitMonth} <= 12`
    ),
  ]
)

export type Visitor = typeof visitors.$inferSelect
export type NewVisitor = typeof visitors.$inferInsert
