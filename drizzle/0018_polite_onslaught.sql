ALTER TABLE "payment" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;