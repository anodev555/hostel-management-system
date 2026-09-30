import {
  boolean,
  check,
  date,
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
    /**
     * Calendar day derived from `paidAt` as `YYYY-MM-DD`.
     *
     * A STORED generated column rather than an app-maintained one, so it can
     * never drift from the timestamp it is derived from and no write path has
     * to remember to set it.
     *
     * This exists because month-range reporting needs a bare, indexable column.
     * Filtering on `paid_at` through a function — for example
     * `make_date(extract(year from paid_at)::int, ...)` — is correct but
     * non-sargable: the column only ever appears inside the expression, so it
     * lands in the plan's `Filter` and no index on it can be used. Comparing
     * this `date` column directly keeps the predicate sargable.
     */
    paidDate: date("paid_date").generatedAlwaysAs(
      () => sql`"paid_at"::date`
    ),
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
    // Org equality + date range: the shape the cash reports filter on.
    index("idx_payment_org_paid_date").on(table.organizationId, table.paidDate),
    check("payment_amount_positive", sql`${table.amount} > 0`),
    index("idx_org_late_payment").on(table.organizationId, table.isLate),
  ]
)

export type PaymentType = typeof payment.$inferSelect
