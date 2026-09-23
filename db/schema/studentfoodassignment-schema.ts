import { sql } from "drizzle-orm"
import {
  decimal,
  timestamp,
  uniqueIndex,
  index,
  uuid,
  date,
  check,
} from "drizzle-orm/pg-core"
import { pgTable } from "drizzle-orm/pg-core"
import { text } from "drizzle-orm/pg-core"

import { organization, user } from "./auth-schema"
import { foodplan } from "./foodplan-schema"
import { student } from "./student-schema"
import { studentRoomAssignmentStatusEnum } from "./studentroomassigment-schema"

/** Reuse room assignment status — same assigned / released lifecycle */
export const studentFoodAssignment = pgTable(
  "student_food_assignment",
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
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    foodPlanId: uuid("food_plan_id")
      .notNull()
      .references(() => foodplan.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    /** Billing period */
    startDate: date("start_date")
      .notNull()
      .default(sql`CURRENT_DATE`),

    endDate: date("end_date"),

    /** Snapshot from food_plan.monthly_price at assign time */
    foodAmount: decimal("food_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),

    status: studentRoomAssignmentStatusEnum("status")
      .notNull()
      .default("assigned"),

    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    assignedBy: text("assigned_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    releasedAt: timestamp("released_at"),
    releasedBy: text("released_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    /** One active food plan per student */
    uniqueIndex("uniq_active_student_food_assignment")
      .on(table.studentId)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),

    /** Same as student_fees — no duplicate active row for same plan */
    uniqueIndex("uniq_active_student_food_plan")
      .on(table.studentId, table.foodPlanId)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),

    check(
      "food_assigned_implies_not_released",
      sql`(${table.status} = 'assigned' AND ${table.releasedAt} IS NULL AND ${table.endDate} IS NULL)
            OR (${table.status} = 'released' AND ${table.releasedAt} IS NOT NULL AND ${table.endDate} IS NOT NULL)`
    ),

    check(
      "food_end_date_after_start_date",
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`
    ),

    index("idx_sfa_org_student_status").on(
      table.organizationId,
      table.studentId,
      table.status
    ),
    index("idx_sfa_food_plan_status").on(table.foodPlanId, table.status),
    index("idx_sfa_student_history").on(table.studentId, table.startDate),
    index("idx_sfa_org_dates").on(
      table.organizationId,
      table.startDate,
      table.endDate
    ),
  ]
)

export type StudentFoodAssignment = typeof studentFoodAssignment.$inferSelect
