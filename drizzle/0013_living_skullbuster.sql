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
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_org_expense_item" ON "expense_items" USING btree ("organization_id","expense_id");--> statement-breakpoint
CREATE INDEX "idx_org_cat_month_year" ON "expenses" USING btree ("organization_id","category","expense_month","expense_year");--> statement-breakpoint
CREATE INDEX "idx_expense_org_date" ON "expenses" USING btree ("organization_id","expense_date");