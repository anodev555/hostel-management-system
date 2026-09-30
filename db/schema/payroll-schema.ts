import { sql } from "drizzle-orm"
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
} from "drizzle-orm/pg-core"

import { member, organization, user } from "./auth-schema"
import { paymentMethod } from "./payment-schema"
import {  tuitionTeacher } from "./tuition-schema"

export const payrollPayeeType = pgEnum("payroll_payee_type", [
  "staff",
  "teacher",
])

export const payrollContractStatus = pgEnum("payroll_contract_status", [
  "active",
  "inactive",
])

export const payrollContract = pgTable(
  "payroll_contract",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    payeeType: payrollPayeeType("payee_type").notNull(),

    memberId: text("member_id").references(() => member.id, {
      onDelete: "cascade",
    }),

    teacherId: uuid("teacher_id").references(() => tuitionTeacher.id, {
      onDelete: "cascade",
    }),

    monthlyAmount: decimal("monthly_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),

    status: payrollContractStatus("status").notNull().default("active"),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_payroll_contract_org_status").on(
      table.organizationId,
      table.status
    ),
    index("idx_payroll_contract_member").on(table.memberId, table.status),
    index("idx_payroll_contract_teacher").on(table.teacherId, table.status),

    uniqueIndex("uniq_active_payroll_contract_staff")
      .on(table.organizationId, table.memberId)
      .where(
        sql`${table.payeeType} = 'staff'
          AND ${table.status} = 'active'
          AND ${table.effectiveTo} IS NULL`
      ),

    uniqueIndex("uniq_active_payroll_contract_teacher")
      .on(table.organizationId, table.teacherId)
      .where(
        sql`${table.payeeType} = 'teacher'
          AND ${table.status} = 'active'
          AND ${table.effectiveTo} IS NULL`
      ),

    check(
      "payroll_contract_payee_shape",
      sql`(
        ${table.payeeType} = 'staff'
        AND ${table.memberId} IS NOT NULL
        AND ${table.teacherId} IS NULL
      ) OR (
        ${table.payeeType} = 'teacher'
        AND ${table.teacherId} IS NOT NULL
        AND ${table.memberId} IS NULL
      )`
    ),

    check(
      "payroll_contract_monthly_amount_positive",
      sql`${table.monthlyAmount} > 0`
    ),

    check(
      "payroll_contract_effective_range",
      sql`${table.effectiveTo} IS NULL OR ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  ]
)

export const payrollInvoiceStatus = pgEnum("payroll_invoice_status", [
  "unpaid",
  "paid",
  "partial",
  "void",
])

export const payrollInvoice = pgTable(
  "payroll_invoice",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    payeeType: payrollPayeeType("payee_type").notNull(),

    memberId: text("member_id").references(() => member.id, {
      onDelete: "cascade",
    }),

    teacherId: uuid("teacher_id").references(() => tuitionTeacher.id, {
      onDelete: "cascade",
    }),

    invoiceNumber: text("invoice_number").notNull(),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),

    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    dueDate: date("due_date").notNull(),

    subTotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),

    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),

    status: payrollInvoiceStatus("status").notNull().default("unpaid"),
    notes: text("notes"),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uniq_payroll_invoice_org_number").on(
      table.organizationId,
      table.invoiceNumber
    ),

    uniqueIndex("uniq_payroll_invoice_org_payee_period")
      .on(
        table.organizationId,
        table.payeeType,
        sql`COALESCE(${table.memberId}, ${table.teacherId}::text)`,
        table.periodYear,
        table.periodMonth
      )
      .where(sql`${table.status} <> 'void'`),

    index("idx_payroll_invoice_org_status").on(
      table.organizationId,
      table.status
    ),
    index("idx_payroll_invoice_org_payee").on(
      table.organizationId,
      table.payeeType,
      table.memberId,
      table.teacherId
    ),
    index("idx_payroll_invoice_org_period").on(
      table.organizationId,
      table.periodYear,
      table.periodMonth
    ),
    index("idx_payroll_invoice_org_due_date").on(
      table.organizationId,
      table.dueDate
    ),

    check(
      "payroll_invoice_payee_shape",
      sql`(
        ${table.payeeType} = 'staff'
        AND ${table.memberId} IS NOT NULL
        AND ${table.teacherId} IS NULL
      ) OR (
        ${table.payeeType} = 'teacher'
        AND ${table.teacherId} IS NOT NULL
        AND ${table.memberId} IS NULL
      )`
    ),

    check(
      "payroll_invoice_period_month_valid",
      sql`${table.periodMonth} >= 1 AND ${table.periodMonth} <= 12`
    ),
    check(
      "payroll_invoice_period_range",
      sql`${table.periodEnd} >= ${table.periodStart}`
    ),
    check("payroll_invoice_total_non_negative", sql`${table.total} >= 0`),
    check("payroll_invoice_subtotal_non_negative", sql`${table.subTotal} >= 0`),
    check("payroll_invoice_paid_non_negative", sql`${table.paidAmount} >= 0`),
    check(
      "payroll_invoice_paid_not_over_total",
      sql`${table.paidAmount} <= ${table.total}`
    ),
    check(
      "payroll_invoice_due_matches",
      sql`${table.dueAmount} = ${table.total} - ${table.paidAmount}`
    ),
  ]
)

export const payrollInvoiceLineItem = pgTable(
  "payroll_invoice_line_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    payrollInvoiceId: uuid("payroll_invoice_id")
      .notNull()
      .references(() => payrollInvoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    description: text("description").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

    chargeStartAt: date("charge_start_at"),
    chargeEndAt: date("charge_end_at"),
    daysCharged: integer("days_charged"),
    daysInMonth: integer("days_in_month"),
    isProrated: boolean("is_prorated").notNull().default(false),

    contractId: uuid("contract_id").references(() => payrollContract.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_payroll_invoice_line_invoice").on(table.payrollInvoiceId),
    index("idx_payroll_invoice_line_org").on(table.organizationId),
    index("idx_payroll_invoice_line_contract").on(table.contractId),

    check("payroll_invoice_line_amount_positive", sql`${table.amount} > 0`),

    check(
      "payroll_invoice_line_proration_dates",
      sql`${table.daysCharged} IS NULL OR (
          ${table.chargeStartAt} IS NOT NULL
          AND ${table.chargeEndAt} IS NOT NULL
          AND ${table.daysInMonth} IS NOT NULL
          AND ${table.chargeEndAt} >= ${table.chargeStartAt}
          AND ${table.daysCharged} >= 1
          AND ${table.daysInMonth} BETWEEN 28 AND 31
          AND ${table.daysCharged} <= ${table.daysInMonth}
        )`
    ),
  ]
)

export const payrollPayment = pgTable(
  "payroll_payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    payrollInvoiceId: uuid("payroll_invoice_id")
      .notNull()
      .references(() => payrollInvoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    payeeType: payrollPayeeType("payee_type").notNull(),
    memberId: text("member_id").references(() => member.id, {
      onDelete: "cascade",
    }),
    teacherId: uuid("teacher_id").references(() => tuitionTeacher.id, {
      onDelete: "cascade",
    }),

    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: paymentMethod("method").notNull(),
    reference: text("reference"),
    paidAt: timestamp("paid_at").notNull().defaultNow(),
    /**
     * Calendar day derived from `paidAt` as `YYYY-MM-DD`. STORED generated
     * column, so it cannot drift from the timestamp and no write path has to
     * set it. Kept as a bare `date` so month-range reporting can filter on it
     * sargably instead of wrapping `paid_at` in `make_date`/`extract`, which
     * would put the column in the plan's `Filter` and make it unindexable.
     */
    paidDate: date("paid_date").generatedAlwaysAs(
      () => sql`"paid_at"::date`
    ),
    notes: text("notes"),

    receivedBy: text("received_by"),
    collectedBy: text("collected_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_payroll_payment_invoice").on(table.payrollInvoiceId),
    // Org equality + date range: the shape the cash reports filter on.
    index("idx_payroll_payment_org_paid_date").on(
      table.organizationId,
      table.paidDate
    ),
    index("idx_payroll_payment_org_payee").on(
      table.organizationId,
      table.payeeType,
      table.memberId,
      table.teacherId
    ),

    check("payroll_payment_amount_positive", sql`${table.amount} > 0`),

    check(
      "payroll_payment_payee_shape",
      sql`(
        ${table.payeeType} = 'staff'
        AND ${table.memberId} IS NOT NULL
        AND ${table.teacherId} IS NULL
      ) OR (
        ${table.payeeType} = 'teacher'
        AND ${table.teacherId} IS NOT NULL
        AND ${table.memberId} IS NULL
      )`
    ),
  ]
)

export const payrollDeductionReason = pgEnum("payroll_deduction_reason", [
  "advance",
  "loan",
  "fine",
  "other",
])

export const payrollDeduction = pgTable(
  "payroll_deduction",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    payrollInvoiceId: uuid("payroll_invoice_id")
      .notNull()
      .references(() => payrollInvoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    payeeType: payrollPayeeType("payee_type").notNull(),
    memberId: text("member_id").references(() => member.id, {
      onDelete: "cascade",
    }),
    teacherId: uuid("teacher_id").references(() => tuitionTeacher.id, {
      onDelete: "cascade",
    }),

    reason: payrollDeductionReason("reason").notNull(),
    description: text("description"),

    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_payroll_deduction_invoice").on(table.payrollInvoiceId),
    index("idx_payroll_deduction_org_payee").on(
      table.organizationId,
      table.payeeType,
      table.memberId,
      table.teacherId
    ),

    check("payroll_deduction_amount_positive", sql`${table.amount} > 0`),

    check(
      "payroll_deduction_payee_shape",
      sql`(
        ${table.payeeType} = 'staff'
        AND ${table.memberId} IS NOT NULL
        AND ${table.teacherId} IS NULL
      ) OR (
        ${table.payeeType} = 'teacher'
        AND ${table.teacherId} IS NOT NULL
        AND ${table.memberId} IS NULL
      )`
    ),
  ]
)
