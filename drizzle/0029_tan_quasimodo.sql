ALTER TABLE "subscription_plan" DROP CONSTRAINT "subscription_plan_yearly_price_non_negative";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP CONSTRAINT "subscription_plan_monthly_price_non_negative";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP CONSTRAINT "subscription_plan_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP CONSTRAINT "subscription_plan_updated_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription_plan" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "monthly_price";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "yearly_price";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "updated_by";--> statement-breakpoint
ALTER TABLE "subscription_plan" ADD CONSTRAINT "subscription_plan_monthly_price_non_negative" CHECK ("subscription_plan"."price" IS NULL OR "subscription_plan"."price" >= 0);