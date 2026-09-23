import { sql } from "drizzle-orm"
import {
  check,
  date,
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { member, organization, user } from "./auth-schema"
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
