ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'esewa', 'bank_transfer', 'cheque', 'khalti', 'other');--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE "public"."payment_method" USING "method"::"public"."payment_method";