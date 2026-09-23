import {
  boolean,
  check,
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { invoice } from "./invoice-schema"
import { organization, user } from "./auth-schema"
import { student } from "./student-schema"
import { sql } from "drizzle-orm"

export const paymentMethod = pgEnum("payment_method", [
  "cash",
  "esewa",
  "bank_transfer",
  "cheque",
  "khalti",
  "other",
])

export const payment = pgTable(
  "payment",
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
    studentId: uuid("student_id")
      .notNull()
      .references(() => student.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    isLate: boolean("is_late").notNull().default(false),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: paymentMethod("method").notNull(),
    reference: text("reference"), // reference number from the payment method
    paidAt: timestamp("paid_at").notNull().defaultNow(),
    notes: text("notes"),
    receivedBy: text("received_by"),
    collectedBy: text("collected_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_payment_invoice").on(table.invoiceId),
    index("idx_payment_org_student").on(table.organizationId, table.studentId),
    check("payment_amount_positive", sql`${table.amount} > 0`),
    index("idx_org_late_payment").on(table.organizationId, table.isLate),
  ]
)

export type PaymentType = typeof payment.$inferSelect
