ALTER TABLE "student_tuition_assignment" DROP CONSTRAINT "student_tuition_assignment_tuition_plan_id_tuition_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_tuition_plan_id_tuition_plan_id_fk" FOREIGN KEY ("tuition_plan_id") REFERENCES "public"."tuition_plan"("id") ON DELETE cascade ON UPDATE cascade;