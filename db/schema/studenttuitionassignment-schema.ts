import { sql } from "drizzle-orm"
import {
  check,
  date,
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { organization, user } from "./auth-schema"
import { student } from "./student-schema"
import { studentRoomAssignmentStatusEnum } from "./studentroomassigment-schema"
import { tuitionPlan } from "./tuition-schema"

/** Reuse room/food assignment status — same assigned / released lifecycle */
export const studentTuitionAssignment = pgTable(
  "student_tuition_assignment",
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

    tuitionPlanId: uuid("tuition_plan_id")
      .notNull()
      .references(() => tuitionPlan.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    /** Billing period */
    startDate: date("start_date")
      .notNull()
      .default(sql`CURRENT_DATE`),

    endDate: date("end_date"),

    /** Snapshot from tuition_plan.monthly_price at assign time */
    tuitionAmount: decimal("tuition_amount", {
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
    /** One active tuition plan per student */
    uniqueIndex("uniq_active_student_tuition_assignment")
      .on(table.studentId)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),

    /** No duplicate active row for same plan */
    uniqueIndex("uniq_active_student_tuition_plan")
      .on(table.studentId, table.tuitionPlanId)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),

    check(
      "tuition_assigned_implies_not_released",
      sql`(${table.status} = 'assigned' AND ${table.releasedAt} IS NULL AND ${table.endDate} IS NULL)
            OR (${table.status} = 'released' AND ${table.releasedAt} IS NOT NULL AND ${table.endDate} IS NOT NULL)`
    ),

    check(
      "tuition_end_date_after_start_date",
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`
    ),

    index("idx_sta_org_student_status").on(
      table.organizationId,
      table.studentId,
      table.status
    ),
    index("idx_sta_tuition_plan_status").on(table.tuitionPlanId, table.status),
    index("idx_sta_student_history").on(table.studentId, table.startDate),
    index("idx_sta_org_dates").on(
      table.organizationId,
      table.startDate,
      table.endDate
    ),
  ]
)

export type StudentTuitionAssignment =
  typeof studentTuitionAssignment.$inferSelect
