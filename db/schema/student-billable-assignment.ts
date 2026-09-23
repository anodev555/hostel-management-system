import { date, decimal, pgView, text, uuid } from "drizzle-orm/pg-core"
import { studentRoomAssignment } from "./studentroomassigment-schema"
import { sql } from "drizzle-orm"
import { studentFoodAssignment } from "./studentfoodassignment-schema"
import { studentTuitionAssignment } from "./studenttuitionassignment-schema"
import { studentFineAssignment } from "./studentfineassignment"

export const studentBillableAssignment = pgView(
  "student_billable_assignments",
  {
    assignmentId: uuid("assignment_id").notNull(),
    organizationId: text("organization_id").notNull(),
    studentId: uuid("student_id").notNull(),
    category: text("category").notNull(), // lodging , food , tuition,fine
    sourceId: uuid("source_id"), // id of the source of the billable assignment
    monthlyAmount: decimal("monthly_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: text("status").notNull(),
  }
).as(
  sql`
    SELECT
    ${studentRoomAssignment.id} as assignment_id,
    ${studentRoomAssignment.organizationId} as organization_id,
    ${studentRoomAssignment.studentId} as student_id,
    'lodging'::text as category,
    ${studentRoomAssignment.roomId} as source_id,
    ${studentRoomAssignment.lodgingAmount} as monthly_amount,
    ${studentRoomAssignment.startDate} as start_date,
    ${studentRoomAssignment.endDate} as end_date,
    ${studentRoomAssignment.status}::text as status
    FROM ${studentRoomAssignment}

    UNION ALL

    SELECT
    ${studentFoodAssignment.id} as assignment_id,
    ${studentFoodAssignment.organizationId} as organization_id,
    ${studentFoodAssignment.studentId} as student_id,
    'food'::text as category,
    ${studentFoodAssignment.foodPlanId} as source_id,
    ${studentFoodAssignment.foodAmount} as monthly_amount,
    ${studentFoodAssignment.startDate} as start_date,
    ${studentFoodAssignment.endDate} as end_date,
    ${studentFoodAssignment.status}::text as status
    FROM ${studentFoodAssignment}

    UNION ALL


  SELECT
    ${studentTuitionAssignment.id} as assignment_id,
    ${studentTuitionAssignment.organizationId} as organization_id,
    ${studentTuitionAssignment.studentId} as student_id,
    'tuition'::text as category,
    ${studentTuitionAssignment.tuitionPlanId} as source_id,
    ${studentTuitionAssignment.tuitionAmount} as monthly_amount,
    ${studentTuitionAssignment.startDate} as start_date,
    ${studentTuitionAssignment.endDate} as end_date,
    ${studentTuitionAssignment.status}::text as status
  FROM ${studentTuitionAssignment}

    UNION ALL
  SELECT
    ${studentFineAssignment.id} as assignment_id,
        ${studentFineAssignment.organizationId} as organization_id,
    ${studentFineAssignment.studentId} as student_id,
    'fine'::text as category,
    ${studentFineAssignment.id} as source_id,
    ${studentFineAssignment.amount} as monthly_amount,
    ${studentFineAssignment.chargedAt} as start_date,
    ${studentFineAssignment.chargedAt} as end_date,
    ${studentFineAssignment.status}::text as status
  FROM ${studentFineAssignment}
    
    `
)
