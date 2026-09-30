CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"visitor_name" text NOT NULL,
	"relation" text NOT NULL,
	"age" integer,
	"expected_visit_duration" text,
	"student_id" uuid,
	"student_name" text NOT NULL,
	"reason" text NOT NULL,
	"checkin_at" timestamp DEFAULT now() NOT NULL,
	"checkout_at" timestamp,
	"visit_date" date NOT NULL,
	"visit_year" integer NOT NULL,
	"visit_month" integer NOT NULL,
	"visit_day_of_month" integer NOT NULL,
	"created_by" text,
	"checkout_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_age_valid" CHECK ("visitors"."age" IS NULL OR "visitors"."age" >= 0),
	CONSTRAINT "visitor_month_valid" CHECK ("visitors"."visit_month" >= 1 AND "visitors"."visit_month" <= 12)
);
--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_checkout_by_user_id_fk" FOREIGN KEY ("checkout_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_visitor_org_date" ON "visitors" USING btree ("organization_id","visit_date");--> statement-breakpoint
CREATE INDEX "idx_visitor_org_month_year" ON "visitors" USING btree ("organization_id","visit_year","visit_month");--> statement-breakpoint
CREATE INDEX "idx_visitor_org_student" ON "visitors" USING btree ("organization_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_visitor_org_checkout" ON "visitors" USING btree ("organization_id","checkout_at");