ALTER TABLE "tuition_plan" DROP CONSTRAINT "tuition_plan_teacher_id_tuition_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "tuition_plan" ADD CONSTRAINT "tuition_plan_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE cascade;