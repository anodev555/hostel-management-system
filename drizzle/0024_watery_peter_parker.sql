CREATE TYPE "public"."payroll_deduction_reason" AS ENUM('advance', 'loan', 'fine', 'other');--> statement-breakpoint
CREATE TABLE "payroll_deduction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_invoice_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"payee_type" "payroll_payee_type" NOT NULL,
	"member_id" text,
	"teacher_id" uuid,
	"reason" "payroll_deduction_reason" NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payroll_deduction_amount_positive" CHECK ("payroll_deduction"."amount" > 0),
	CONSTRAINT "payroll_deduction_payee_shape" CHECK ((
        "payroll_deduction"."payee_type" = 'staff'
        AND "payroll_deduction"."member_id" IS NOT NULL
        AND "payroll_deduction"."teacher_id" IS NULL
      ) OR (
        "payroll_deduction"."payee_type" = 'teacher'
        AND "payroll_deduction"."teacher_id" IS NOT NULL
        AND "payroll_deduction"."member_id" IS NULL
      ))
);
--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_payroll_invoice_id_payroll_invoice_id_fk" FOREIGN KEY ("payroll_invoice_id") REFERENCES "public"."payroll_invoice"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_deduction" ADD CONSTRAINT "payroll_deduction_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payroll_deduction_invoice" ON "payroll_deduction" USING btree ("payroll_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_deduction_org_payee" ON "payroll_deduction" USING btree ("organization_id","payee_type","member_id","teacher_id");