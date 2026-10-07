CREATE TYPE "public"."organization_subscription_status" AS ENUM('active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "organization_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "organization_subscription_status" DEFAULT 'active' NOT NULL,
	"plan_name" text NOT NULL,
	"price_at_signup" numeric(10, 2) NOT NULL,
	"max_students_snapshot" integer,
	"max_staff_snapshot" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"next_billing_date" date NOT NULL,
	"cancelled_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_subscription_price_non_negative" CHECK ("organization_subscription"."price_at_signup" >= 0)
);
--> statement-breakpoint
CREATE TABLE "subscription_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"yearly_price" numeric(10, 2),
	"max_students" integer,
	"max_staff" integer,
	"status" "subscription_plan_status" DEFAULT 'active' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plan_monthly_price_non_negative" CHECK ("subscription_plan"."monthly_price" >= 0),
	CONSTRAINT "subscription_plan_yearly_price_non_negative" CHECK ("subscription_plan"."yearly_price" IS NULL OR "subscription_plan"."yearly_price" >= 0),
	CONSTRAINT "subscription_plan_max_students_positive" CHECK ("subscription_plan"."max_students" IS NULL OR "subscription_plan"."max_students" >= 1),
	CONSTRAINT "subscription_plan_max_staff_positive" CHECK ("subscription_plan"."max_staff" IS NULL OR "subscription_plan"."max_staff" >= 1)
);
--> statement-breakpoint
ALTER TABLE "organization_subscription" ADD CONSTRAINT "organization_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_subscription" ADD CONSTRAINT "organization_subscription_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plan"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_subscription" ADD CONSTRAINT "organization_subscription_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_plan" ADD CONSTRAINT "subscription_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_plan" ADD CONSTRAINT "subscription_plan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_subscription_unique_active_org" ON "organization_subscription" USING btree ("organization_id") WHERE "organization_subscription"."status" = 'active';--> statement-breakpoint
CREATE INDEX "organization_subscription_index_org_status" ON "organization_subscription" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "organization_subscription_index_plan" ON "organization_subscription" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "organization_subscription_index_next_billing" ON "organization_subscription" USING btree ("status","next_billing_date");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_plan_unique_name" ON "subscription_plan" USING btree ("name");--> statement-breakpoint
CREATE INDEX "subscription_plan_index_status" ON "subscription_plan" USING btree ("status");