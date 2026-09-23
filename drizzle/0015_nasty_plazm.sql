ALTER TABLE "expense_items" DROP CONSTRAINT "quantity_positive";--> statement-breakpoint
ALTER TABLE "expense_items" DROP CONSTRAINT "line_amount_matches";--> statement-breakpoint
ALTER TABLE "expense_items" ADD COLUMN "quantity" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "quantity_positive" CHECK ("expense_items"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "line_amount_matches" CHECK ("expense_items"."amount" = ROUND("expense_items"."quantity" * "expense_items"."unit_price", 2));