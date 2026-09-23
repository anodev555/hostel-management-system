CREATE TYPE "public"."expense_category" AS ENUM('rent', 'utilities', 'maintenance', 'fuel', 'food', 'other');--> statement-breakpoint
CREATE TYPE "public"."expense_payment_method" AS ENUM('cash', 'bank_transfer', 'esewa', 'khalti', 'other');--> statement-breakpoint
CREATE TABLE "expense_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"expense_id" text NOT NULL,
	"item_name" text NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_positive" CHECK ("expense_items"."unit_price" > 0),
	CONSTRAINT "unitprice_positive" CHECK ("expense_items"."unit_price" > 0),
	CONSTRAINT "amount_positive" CHECK ("expense_items"."amount" > 0),
	CONSTRAINT "line_amount_matches" CHECK ("expense_items"."amount" = ROUND("expense_items"."unit_price" * "expense_items"."unit_price", 2))
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"expense_date" date NOT NULL,
	"expense_year" integer NOT NULL,
	"expense_month" integer NOT NULL,
	"category" "expense_category" NOT NULL,
	"bill_number" text,
	"bill_photo" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" "expense_payment_method" NOT NULL,
	"paid_to" text,
	"paid_by" text NOT NULL,
	"remarks" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expense_month_valid" CHECK ("expenses"."expense_month" >= 1 AND "expenses"."expense_month" <= 12),
	CONSTRAINT "totalamount_positive" CHECK ("expenses"."total_amount" > 0.00)
);
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_staff_monthly";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_monthly_amount";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_per_student_rate";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_payee_shape";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_tuition_plan_id_tuition_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_member_id_member_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_teacher_id_tuition_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP CONSTRAINT "payroll_contract_updated_by_user_id_fk";
--> statement-breakpoint
DROP INDEX "idx_payroll_contract_teacher_plan";--> statement-breakpoint
DROP INDEX "uniq_active_payroll_contract_teacher_plan";--> statement-breakpoint
DROP INDEX "uniq_active_payroll_contract_staff";--> statement-breakpoint
ALTER TABLE "payroll_contract" ALTER COLUMN "monthly_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_org_expense_item" ON "expense_items" USING btree ("organization_id","expense_id");--> statement-breakpoint
CREATE INDEX "idx_org_cat_month_year" ON "expenses" USING btree ("organization_id","category","expense_month","expense_year");--> statement-breakpoint
CREATE INDEX "idx_expense_org_date" ON "expenses" USING btree ("organization_id","expense_date");--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payroll_contract_teacher" ON "payroll_contract" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_payroll_contract_teacher" ON "payroll_contract" USING btree ("organization_id","teacher_id") WHERE "payroll_contract"."payee_type" = 'teacher'
          AND "payroll_contract"."status" = 'active'
          AND "payroll_contract"."effective_to" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_payroll_contract_staff" ON "payroll_contract" USING btree ("organization_id","member_id") WHERE "payroll_contract"."payee_type" = 'staff'
          AND "payroll_contract"."status" = 'active'
          AND "payroll_contract"."effective_to" IS NULL;--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP COLUMN "tuition_plan_id";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP COLUMN "pay_type";--> statement-breakpoint
ALTER TABLE "payroll_contract" DROP COLUMN "per_student_rate";--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_monthly_amount_positive" CHECK ("payroll_contract"."monthly_amount" > 0);--> statement-breakpoint
ALTER TABLE "payroll_contract" ADD CONSTRAINT "payroll_contract_payee_shape" CHECK ((
        "payroll_contract"."payee_type" = 'staff'
        AND "payroll_contract"."member_id" IS NOT NULL
        AND "payroll_contract"."teacher_id" IS NULL
      ) OR (
        "payroll_contract"."payee_type" = 'teacher'
        AND "payroll_contract"."teacher_id" IS NOT NULL
        AND "payroll_contract"."member_id" IS NULL
      ));--> statement-breakpoint
DROP TYPE "public"."payroll_pay_type";