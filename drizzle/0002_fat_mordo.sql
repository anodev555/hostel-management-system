DROP VIEW "public"."student_billable_assignments";--> statement-breakpoint
CREATE VIEW "public"."student_billable_assignments" AS (
    SELECT
    "student_room_assignment"."id" as assignment_id,
    "student_room_assignment"."organization_id" as organization_id,
    "student_room_assignment"."student_id" as student_id,
    'lodging'::text as category,
    "student_room_assignment"."room_id" as source_id,
    "student_room_assignment"."lodging_amount" as monthly_amount,
    "student_room_assignment"."start_date" as start_date,
    "student_room_assignment"."end_date" as end_date,
    "student_room_assignment"."status"::text as status
    FROM "student_room_assignment"

    UNION ALL

    SELECT
    "student_food_assignment"."id" as assignment_id,
    "student_food_assignment"."organization_id" as organization_id,
    "student_food_assignment"."student_id" as student_id,
    'food'::text as category,
    "student_food_assignment"."food_plan_id" as source_id,
    "student_food_assignment"."food_amount" as monthly_amount,
    "student_food_assignment"."start_date" as start_date,
    "student_food_assignment"."end_date" as end_date,
    "student_food_assignment"."status"::text as status
    FROM "student_food_assignment"

    UNION ALL


  SELECT
    "student_tuition_assignment"."id" as assignment_id,
    "student_tuition_assignment"."organization_id" as organization_id,
    "student_tuition_assignment"."student_id" as student_id,
    'tuition'::text as category,
    "student_tuition_assignment"."tuition_plan_id" as source_id,
    "student_tuition_assignment"."tuition_amount" as monthly_amount,
    "student_tuition_assignment"."start_date" as start_date,
    "student_tuition_assignment"."end_date" as end_date,
    "student_tuition_assignment"."status"::text as status
  FROM "student_tuition_assignment"

    UNION ALL
  SELECT
    "student_fines"."id" as assignment_id,
        "student_fines"."organization_id" as organization_id,
    "student_fines"."student_id" as student_id,
    'fine'::text as category,
    "student_fines"."id" as source_id,
    "student_fines"."amount" as monthly_amount,
    "student_fines"."charged_at" as start_date,
    "student_fines"."charged_at" as end_date,
    "student_fines"."status"::text as status
  FROM "student_fines"
    
    );