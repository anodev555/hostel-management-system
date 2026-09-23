CREATE TYPE "public"."payroll_contract_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."payroll_pay_type" AS ENUM('monthly', 'per_active_student');--> statement-breakpoint
CREATE TYPE "public"."payroll_payee_type" AS ENUM('staff', 'teacher');--> statement-breakpoint
CREATE TABLE "payroll_contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"payee_type" "payroll_payee_type" NOT NULL,
	"member_id" text,
	"teacher_id" uuid,
	"tuition_plan_id" uuid,
	"pay_type" "payroll_pay_type" DEFAULT 'monthly' NOT NULL,
	"monthly_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"per_student_rate" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" "payroll_contract_status" DEFAULT 'active' NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payroll_contract_payee_shape" CHECK ((
        "payroll_contract"."payee_type" = 'staff'
        AND "payroll_contract"."member_id" IS NOT NULL
        AND "payroll_contract"."teacher_id" IS NULL
        AND "payroll_contract"."tuition_plan_id" IS NULL
      ) OR (
        "payroll_contract"."payee_type" = 'teacher'
        AND "payroll_contract"."teacher_id" IS NOT NULL
        AND "payroll_contract"."tuition_plan_id" IS NOT NULL
        AND "payroll_contract"."member_id" IS NULL
      )),
	CONSTRAINT "payroll_contract_staff_monthly" CHECK ("payroll_contract"."payee_type" = 'teacher' OR "payroll_contract"."pay_type" = 'monthly'),
	CONSTRAINT "payroll_contract_effective_range" CHECK ("payroll_contract"."effective_to" IS NULL OR "payroll_contract"."effective_to" >= "payroll_contract"."effective_from"),
	CONSTRAINT "payroll_contract_monthly_amount" CHECK ("payroll_contract"."pay_type" <> 'monthly' OR "payroll_contract"."monthly_amount" > 0),
	CONSTRAINT "payroll_contract_per_student_rate" CHECK ("payroll_contract"."pay_type" <> 'per_active_student' OR "payroll_contract"."per_student_rate" > 0)
);
--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_tuition_plan_id_tuition_plan_id_fk" FOREIGN KEY ("tuition_plan_id") REFERENCES "public"."tuition_plan"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_payroll_contract_org_status" ON "payroll_contract" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_payroll_contract_member" ON "payroll_contract" USING btree ("member_id","status");--> statement-breakpoint
CREATE INDEX "idx_payroll_contract_teacher_plan" ON "payroll_contract" USING btree ("teacher_id","tuition_plan_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_payroll_contract_staff" ON "payroll_contract" USING btree ("organization_id","member_id") WHERE "payroll_contract"."status" = 'active' AND "payroll_contract"."member_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_payroll_contract_teacher_plan" ON "payroll_contract" USING btree ("organization_id","teacher_id","tuition_plan_id") WHERE "payroll_contract"."status" = 'active'
          AND "payroll_contract"."teacher_id" IS NOT NULL
          AND "payroll_contract"."tuition_plan_id" IS NOT NULL;