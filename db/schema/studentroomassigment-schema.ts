import { sql } from "drizzle-orm"
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
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"
import { room } from "./room-schema"
import { student } from "./student-schema"

export const studentRoomAssignmentStatusEnum = pgEnum(
  "student_room_assignment_status",
  ["assigned", "released"]
)

export const studentRoomAssignment = pgTable(
  "student_room_assignment",
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
    roomId: uuid("room_id")
      .notNull()
      .references(() => room.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    bedNumber: integer("bed_number").notNull(),
    /** Billing period — use dates for invoice runs */
    startDate: date("start_date")
      .notNull()
      .default(sql`CURRENT_DATE`),
    endDate: date("end_date"), // set on release
    /** Snapshot from room → lodging_plan.monthly_price at assign time */
    lodgingAmount: decimal("lodging_amount", {
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
    // --- Partial uniques (active = assigned + no end date) ---
    /** One active room assignment per student */
    uniqueIndex("uniq_active_student_room_assignment")
      .on(table.studentId)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),
    /** One student per physical bed while active */
    uniqueIndex("uniq_active_room_bed")
      .on(table.roomId, table.bedNumber)
      .where(sql`${table.status} = 'assigned' AND ${table.endDate} IS NULL`),
    // --- Checks ---
    check("bed_number_positive", sql`${table.bedNumber} >= 1`),
    check(
      "assigned_implies_not_released",
      sql`(${table.status} = 'assigned' AND ${table.releasedAt} IS NULL AND ${table.endDate} IS NULL)
          OR (${table.status} = 'released' AND ${table.releasedAt} IS NOT NULL AND ${table.endDate} IS NOT NULL)`
    ),
    check(
      "end_date_after_start_date",
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`
    ),
    // --- Indexes for queries ---
    index("idx_sra_org_student_status").on(
      table.organizationId,
      table.studentId,
      table.status
    ),
    index("idx_sra_room_status").on(table.roomId, table.status),
    index("idx_sra_student_history").on(table.studentId, table.startDate),
    index("idx_sra_org_dates").on(
      table.organizationId,
      table.startDate,
      table.endDate
    ),
  ]
)
export type StudentRoomAssignment = typeof studentRoomAssignment.$inferSelect
