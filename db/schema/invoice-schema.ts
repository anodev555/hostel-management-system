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
  uuid,
} from "drizzle-orm/pg-core"
import { organization } from "./auth-schema"
import { student } from "./student-schema"
import { uniqueIndex } from "drizzle-orm/pg-core"
import { ne, sql } from "drizzle-orm"

export const invoiceStatus = pgEnum("invoice_status", [
  "unpaid",
  "paid",
  "partial",
  "void",
])

export const invoice = pgTable(
  "invoice",
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
    invoiceNumber: text("invoice_number").notNull(),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),

    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    dueDate: date("due_date").notNull(),

    subTotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // sum of line items of this invoice
    total: decimal("total", { precision: 10, scale: 2 }).notNull(), // subTotal +  if tax or discount is applied

    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"), // amount paid for this invoice
    dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),

    status: invoiceStatus("status").notNull().default("unpaid"),
    notes: text("notes"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("idx_invoice_orgid_stuid_period")
      .on(
        table.organizationId,
        table.studentId,
        table.periodYear,
        table.periodMonth
      )
      .where(sql`${table.status} <> 'void'`),

    uniqueIndex("uniq_invoice_org_number").on(
      table.organizationId,
      table.invoiceNumber
    ),

    index("idx_invoice_org_status").on(table.organizationId, table.status),
    index("idx_invoice_org_student").on(table.organizationId, table.studentId),

    index("idx_invoice_org_period").on(
      table.organizationId,
      table.periodYear,
      table.periodMonth
    ),

    index("idx_invoice_org_due_date").on(table.organizationId, table.dueDate),
    //period month must be between 1 and 12
    check(
      "invoice_period_month_valid",
      sql`${table.periodMonth} >= 1 AND ${table.periodMonth} <= 12`
    ),
    //period end must be greater than or equal to period start
    check(
      "invoice_period_range",
      sql`${table.periodEnd} >= ${table.periodStart}`
    ),

    check("invoice_total_non_negative", sql`${table.total} >= 0`),
    check("invoice_subtotal_non_negative", sql`${table.subTotal} >= 0`),
    check("invoice_paid_non_negative", sql`${table.paidAmount} >= 0`),

    //paid amount must be less than or equal to total
    check(
      "invoice_paid_not_over_total",
      sql`${table.paidAmount} <= ${table.total}`
    ),

    check(
      "invoice_due_matches",
      sql`${table.dueAmount} = ${table.total} - ${table.paidAmount}`
    ),
  ]
)

export const invoiceLineItemCategory = pgEnum("invoice_line_item_category", [
  "tuition",
  "lodging",
  "food",
  "fine",
])

export const invoiceLineItem = pgTable(
  "invoice_line_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoice.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    category: invoiceLineItemCategory("category").notNull(),
    description: text("description").notNull(),

    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

    // Recurring only. Null on fine.
    chargeStartAt: date("charge_start_at"),
    chargeEndAt: date("charge_end_at"),
    daysCharged: integer("days_charged"),
    daysInMonth: integer("days_in_month"),
    isProrated: boolean("is_prorated").notNull().default(false),

    // room / food / tuition / fine assignment id (no FK — 4 tables)
    assignmentId: uuid("assignment_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_invoice_line_invoice").on(table.invoiceId),
    index("idx_invoice_line_org").on(table.organizationId),
    index("idx_invoice_line_assignment").on(table.assignmentId),

    check("invoice_line_amount_non_negative", sql`${table.amount} > 0`),

    check(
      "invoice_line_fine_no_proration",
      sql`${table.category} <> 'fine' OR (
          ${table.chargeStartAt} IS NULL
          AND ${table.chargeEndAt} IS NULL
          AND ${table.daysCharged} IS NULL
          AND ${table.daysInMonth} IS NULL
          AND ${table.isProrated} = false
        )`
    ),

    check(
      "invoice_line_recurring_dates",
      sql`${table.category} = 'fine' OR (
          ${table.chargeStartAt} IS NOT NULL
          AND ${table.chargeEndAt} IS NOT NULL
          AND ${table.daysCharged} IS NOT NULL
          AND ${table.daysInMonth} IS NOT NULL
          AND ${table.chargeEndAt} >= ${table.chargeStartAt}
          AND ${table.daysCharged} >= 1
          AND ${table.daysInMonth} BETWEEN 28 AND 31
          AND ${table.daysCharged} <= ${table.daysInMonth}
        )`
    ),
  ]
)
export type InvoiceType = typeof invoice.$inferSelect
export type InvoiceLineItemType = typeof invoiceLineItem.$inferSelect
