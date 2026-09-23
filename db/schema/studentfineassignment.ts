import {
  check,
  date,
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"
import { student } from "./student-schema"
import { sql } from "drizzle-orm"
import { invoice } from "./invoice-schema"
import { timestamp } from "drizzle-orm/pg-core"
export const studentFineStatus = pgEnum("student_fine_status", [
  "pending",
  "billed",
  "waived",
])
export const studentFineAssignment = pgTable(
  "student_fines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    studentId: uuid("student_id")
      .notNull()
      .references(() => student.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    type: text("title").notNull(),
    amount: decimal("amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    chargedAt: date("charged_at")
      .notNull()
      .default(sql`CURRENT_DATE`),

    billedInvoiceId: uuid("billed_invoice_id").references(() => invoice.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    billedAt: timestamp("billed_at"),
    status: studentFineStatus("status").notNull().default("pending"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    waivedBy: text("waived_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    waivedAt: timestamp("waived_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_student_fine_org_student").on(
      table.organizationId,
      table.studentId
    ),

    index("idx_student_fine_org_pending").on(
      table.organizationId,
      table.status,
      table.chargedAt
    ),
    index("idx_student_fine_invoice").on(table.billedInvoiceId),
    check("student_fine_amount_positive", sql`${table.amount} > 0`),
    check(
      "student_fine_billed_state",
      sql`(
          ${table.status} = 'pending'
          AND ${table.billedInvoiceId} IS NULL
          AND ${table.billedAt} IS NULL
          AND ${table.waivedAt} IS NULL
        ) OR (
          ${table.status} = 'billed'
          AND ${table.billedInvoiceId} IS NOT NULL
          AND ${table.billedAt} IS NOT NULL
          AND ${table.waivedAt} IS NULL
        ) OR (
          ${table.status} = 'waived'
          AND ${table.billedInvoiceId} IS NULL
          AND ${table.billedAt} IS NULL
          AND ${table.waivedAt} IS NOT NULL
        )`
    ),
  ]
)
