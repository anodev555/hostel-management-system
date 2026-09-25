CREATE TYPE "public"."payroll_invoice_status" AS ENUM('unpaid', 'paid', 'partial', 'void');--> statement-breakpoint
CREATE TABLE "payroll_invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"payee_type" "payroll_payee_type" NOT NULL,
	"member_id" text,
	"teacher_id" uuid,
	"invoice_number" text NOT NULL,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"due_amount" numeric(10, 2) NOT NULL,
	"status" "payroll_invoice_status" DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payroll_invoice_payee_shape" CHECK ((
        "payroll_invoice"."payee_type" = 'staff'
        AND "payroll_invoice"."member_id" IS NOT NULL
        AND "payroll_invoice"."teacher_id" IS NULL
      ) OR (
        "payroll_invoice"."payee_type" = 'teacher'
        AND "payroll_invoice"."teacher_id" IS NOT NULL
        AND "payroll_invoice"."member_id" IS NULL
      )),
	CONSTRAINT "payroll_invoice_period_month_valid" CHECK ("payroll_invoice"."period_month" >= 1 AND "payroll_invoice"."period_month" <= 12),
	CONSTRAINT "payroll_invoice_period_range" CHECK ("payroll_invoice"."period_end" >= "payroll_invoice"."period_start"),
	CONSTRAINT "payroll_invoice_total_non_negative" CHECK ("payroll_invoice"."total" >= 0),
	CONSTRAINT "payroll_invoice_subtotal_non_negative" CHECK ("payroll_invoice"."subtotal" >= 0),
	CONSTRAINT "payroll_invoice_paid_non_negative" CHECK ("payroll_invoice"."paid_amount" >= 0),
	CONSTRAINT "payroll_invoice_paid_not_over_total" CHECK ("payroll_invoice"."paid_amount" <= "payroll_invoice"."total"),
	CONSTRAINT "payroll_invoice_due_matches" CHECK ("payroll_invoice"."due_amount" = "payroll_invoice"."total" - "payroll_invoice"."paid_amount")
);
--> statement-breakpoint
CREATE TABLE "payroll_invoice_line_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_invoice_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"charge_start_at" date,
	"charge_end_at" date,
	"days_charged" integer,
	"days_in_month" integer,
	"is_prorated" boolean DEFAULT false NOT NULL,
	"contract_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payroll_invoice_line_amount_positive" CHECK ("payroll_invoice_line_item"."amount" > 0),
	CONSTRAINT "payroll_invoice_line_proration_dates" CHECK ("payroll_invoice_line_item"."days_charged" IS NULL OR (
          "payroll_invoice_line_item"."charge_start_at" IS NOT NULL
          AND "payroll_invoice_line_item"."charge_end_at" IS NOT NULL
          AND "payroll_invoice_line_item"."days_in_month" IS NOT NULL
          AND "payroll_invoice_line_item"."charge_end_at" >= "payroll_invoice_line_item"."charge_start_at"
          AND "payroll_invoice_line_item"."days_charged" >= 1
          AND "payroll_invoice_line_item"."days_in_month" BETWEEN 28 AND 31
          AND "payroll_invoice_line_item"."days_charged" <= "payroll_invoice_line_item"."days_in_month"
        ))
);
--> statement-breakpoint
CREATE TABLE "payroll_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_invoice_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"payee_type" "payroll_payee_type" NOT NULL,
	"member_id" text,
	"teacher_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"reference" text,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"received_by" text,
	"collected_by" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payroll_payment_amount_positive" CHECK ("payroll_payment"."amount" > 0),
	CONSTRAINT "payroll_payment_payee_shape" CHECK ((
        "payroll_payment"."payee_type" = 'staff'
        AND "payroll_payment"."member_id" IS NOT NULL
        AND "payroll_payment"."teacher_id" IS NULL
      ) OR (
        "payroll_payment"."payee_type" = 'teacher'
        AND "payroll_payment"."teacher_id" IS NOT NULL
        AND "payroll_payment"."member_id" IS NULL
      ))
);
--> statement-breakpoint
ALTER TABLE "payroll_invoice" ADD CONSTRAINT "payroll_invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_invoice" ADD CONSTRAINT "payroll_invoice_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_invoice" ADD CONSTRAINT "payroll_invoice_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_invoice" ADD CONSTRAINT "payroll_invoice_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_invoice" ADD CONSTRAINT "payroll_invoice_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_invoice_line_item" ADD CONSTRAINT "payroll_invoice_line_item_payroll_invoice_id_payroll_invoice_id_fk" FOREIGN KEY ("payroll_invoice_id") REFERENCES "public"."payroll_invoice"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_invoice_line_item" ADD CONSTRAINT "payroll_invoice_line_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_invoice_line_item" ADD CONSTRAINT "payroll_invoice_line_item_contract_id_payroll_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."payroll_contract"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_payroll_invoice_id_payroll_invoice_id_fk" FOREIGN KEY ("payroll_invoice_id") REFERENCES "public"."payroll_invoice"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_collected_by_user_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD CONSTRAINT "payroll_payment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_payroll_invoice_org_number" ON "payroll_invoice" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_payroll_invoice_org_payee_period" ON "payroll_invoice" USING btree ("organization_id","payee_type",COALESCE("member_id", "teacher_id"::text),"period_year","period_month") WHERE "payroll_invoice"."status" <> 'void';--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_org_status" ON "payroll_invoice" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_org_payee" ON "payroll_invoice" USING btree ("organization_id","payee_type","member_id","teacher_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_org_period" ON "payroll_invoice" USING btree ("organization_id","period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_org_due_date" ON "payroll_invoice" USING btree ("organization_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_line_invoice" ON "payroll_invoice_line_item" USING btree ("payroll_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_line_org" ON "payroll_invoice_line_item" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_invoice_line_contract" ON "payroll_invoice_line_item" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_payment_invoice" ON "payroll_payment" USING btree ("payroll_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_payment_org_payee" ON "payroll_payment" USING btree ("organization_id","payee_type","member_id","teacher_id");