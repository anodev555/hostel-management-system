ALTER TABLE "payment" ADD COLUMN "paid_date" date GENERATED ALWAYS AS ("paid_at"::date) STORED;--> statement-breakpoint
ALTER TABLE "payroll_payment" ADD COLUMN "paid_date" date GENERATED ALWAYS AS ("paid_at"::date) STORED;--> statement-breakpoint
CREATE INDEX "idx_payment_org_paid_date" ON "payment" USING btree ("organization_id","paid_date");--> statement-breakpoint
CREATE INDEX "idx_payroll_payment_org_paid_date" ON "payroll_payment" USING btree ("organization_id","paid_date");