ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_member_id_member_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_teacher_id_tuition_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE cascade;