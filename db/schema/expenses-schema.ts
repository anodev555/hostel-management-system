import {
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
import { organization, user } from "./auth-schema"
import { sql } from "drizzle-orm"

export const ExpenseCategory = pgEnum("expense_category", [
  "rent",
  "utilities",
  "maintenance",
  "fuel",
  "food",
  "other",
])

export const ExpensePaymentMethod = pgEnum("expense_payment_method", [
  "cash",
  "bank_transfer",
  "esewa",
  "khalti",
  "other",
])

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    expenseDate: date("expense_date").notNull(),
    expenseYear: integer("expense_year").notNull(),
    expenseMonth: integer("expense_month").notNull(),
    expenseDayOfMonth: integer("expense_day_of_month").notNull(),
    category: ExpenseCategory("category").notNull(),
    billNumber: text("bill_number"),
    billPhoto: text("bill_photo"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: ExpensePaymentMethod("payment_method").notNull(),
    paidTo: text("paid_to"),
    paidBy: text("paid_by").notNull(),
    remarks: text("remarks"),
    createdBy: text("created_by").references(() => user.id, {
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
    index("idx_org_cat_month_year").on(
      table.organizationId,
      table.category,
      table.expenseMonth,
      table.expenseYear
    ),
    index("idx_expense_org_date").on(table.organizationId, table.expenseDate),
    check(
      "expense_month_valid",
      sql`${table.expenseMonth} >= 1 AND ${table.expenseMonth} <= 12`
    ),
    check("totalamount_positive", sql`${table.totalAmount} > 0.00`),
  ]
)

export const expenseItems = pgTable(
  "expense_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    itemName: text("item_name").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_org_expense_item").on(table.organizationId, table.expenseId),
    check("quantity_positive", sql`${table.quantity} > 0`),
    check("unitprice_positive", sql`${table.unitPrice} > 0`),
    check("amount_positive", sql`${table.amount} > 0`),
    check(
      "line_amount_matches",
      sql`${table.amount} = ${table.quantity} * ${table.unitPrice}`
    ),
  ]
)

export type ExpensePaymentMethod =
  (typeof ExpensePaymentMethod.enumValues)[number]
export type ExpenseCategory = (typeof ExpenseCategory.enumValues)[number]
