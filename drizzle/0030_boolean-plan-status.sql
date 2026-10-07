ALTER TABLE "subscription_plan" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE "subscription_plan" SET "is_active" = ("status" = 'active');--> statement-breakpoint
DROP INDEX "subscription_plan_index_status";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."subscription_plan_status";--> statement-breakpoint
CREATE INDEX "subscription_plan_index_is_active" ON "subscription_plan" USING btree ("is_active");
