ALTER TABLE "payroll_contract" ALTER COLUMN "per_student_rate" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payroll_contract" ALTER COLUMN "per_student_rate" DROP NOT NULL;