ALTER TABLE "payroll_contract" ALTER COLUMN "monthly_amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payroll_contract" ALTER COLUMN "monthly_amount" DROP NOT NULL;