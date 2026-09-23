CREATE TYPE "public"."user_role" AS ENUM('superAdmin', 'orgUser');--> statement-breakpoint
CREATE TYPE "public"."document_side" AS ENUM('front', 'back', 'single');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('nid', 'transcript', 'certificate', 'citizenship', 'college_id', 'addmission_letter', 'other');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('active', 'inactive', 'suspended', 'checkedOut');--> statement-breakpoint
CREATE TYPE "public"."food_plan_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."student_room_assignment_status" AS ENUM('assigned', 'released');--> statement-breakpoint
CREATE TYPE "public"."teacher_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."tuition_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."invoice_line_item_category" AS ENUM('tuition', 'lodging', 'food', 'fine');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('unpaid', 'paid', 'partial', 'void');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'esewa', 'bank', 'khalti', 'other');--> statement-breakpoint
CREATE TYPE "public"."student_fine_status" AS ENUM('pending', 'billed', 'waived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_role" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'orgUser' NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"contact_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lodging_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_number" integer NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text,
	"floor" integer NOT NULL,
	"fans" integer DEFAULT 0 NOT NULL,
	"total_beds" integer NOT NULL,
	"attached_bathroom" boolean DEFAULT false NOT NULL,
	"air_conditioner" boolean DEFAULT false NOT NULL,
	"lodging_plan_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "room_total_beds_positive" CHECK ("room"."total_beds" >= 1)
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"student_phone" text NOT NULL,
	"college_or_school" text NOT NULL,
	"course" text NOT NULL,
	"profile_image" text,
	"province" text NOT NULL,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"municipality" text NOT NULL,
	"ward" integer NOT NULL,
	"date_of_birth" date NOT NULL,
	"addmission_date" date NOT NULL,
	"addmission_number" text NOT NULL,
	"gender" "gender" NOT NULL,
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"father_name" text NOT NULL,
	"mother_name" text NOT NULL,
	"guardian_phone_1" text NOT NULL,
	"guardian_phone_2" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "student_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size_mb" integer NOT NULL,
	"document_type" "document_type" NOT NULL,
	"document_side" "document_side" NOT NULL,
	"path" text NOT NULL,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "food_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"status" "food_plan_status" DEFAULT 'active' NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_room_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"bed_number" integer NOT NULL,
	"start_date" date DEFAULT CURRENT_DATE NOT NULL,
	"end_date" date,
	"lodging_amount" numeric(10, 2) NOT NULL,
	"status" "student_room_assignment_status" DEFAULT 'assigned' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	"released_at" timestamp,
	"released_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bed_number_positive" CHECK ("student_room_assignment"."bed_number" >= 1),
	CONSTRAINT "assigned_implies_not_released" CHECK (("student_room_assignment"."status" = 'assigned' AND "student_room_assignment"."released_at" IS NULL AND "student_room_assignment"."end_date" IS NULL)
          OR ("student_room_assignment"."status" = 'released' AND "student_room_assignment"."released_at" IS NOT NULL AND "student_room_assignment"."end_date" IS NOT NULL)),
	CONSTRAINT "end_date_after_start_date" CHECK ("student_room_assignment"."end_date" IS NULL OR "student_room_assignment"."end_date" >= "student_room_assignment"."start_date")
);
--> statement-breakpoint
CREATE TABLE "student_food_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"food_plan_id" uuid NOT NULL,
	"start_date" date DEFAULT CURRENT_DATE NOT NULL,
	"end_date" date,
	"food_amount" numeric(10, 2) NOT NULL,
	"status" "student_room_assignment_status" DEFAULT 'assigned' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	"released_at" timestamp,
	"released_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "food_assigned_implies_not_released" CHECK (("student_food_assignment"."status" = 'assigned' AND "student_food_assignment"."released_at" IS NULL AND "student_food_assignment"."end_date" IS NULL)
            OR ("student_food_assignment"."status" = 'released' AND "student_food_assignment"."released_at" IS NOT NULL AND "student_food_assignment"."end_date" IS NOT NULL)),
	CONSTRAINT "food_end_date_after_start_date" CHECK ("student_food_assignment"."end_date" IS NULL OR "student_food_assignment"."end_date" >= "student_food_assignment"."start_date")
);
--> statement-breakpoint
CREATE TABLE "tuition_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"status" "tuition_status" DEFAULT 'active' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tuition_teacher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"email" text,
	"subject" text,
	"address" text,
	"phone" text,
	"created_by" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_tuition_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"tuition_plan_id" uuid NOT NULL,
	"start_date" date DEFAULT CURRENT_DATE NOT NULL,
	"end_date" date,
	"tuition_amount" numeric(10, 2) NOT NULL,
	"status" "student_room_assignment_status" DEFAULT 'assigned' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	"released_at" timestamp,
	"released_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tuition_assigned_implies_not_released" CHECK (("student_tuition_assignment"."status" = 'assigned' AND "student_tuition_assignment"."released_at" IS NULL AND "student_tuition_assignment"."end_date" IS NULL)
            OR ("student_tuition_assignment"."status" = 'released' AND "student_tuition_assignment"."released_at" IS NOT NULL AND "student_tuition_assignment"."end_date" IS NOT NULL)),
	CONSTRAINT "tuition_end_date_after_start_date" CHECK ("student_tuition_assignment"."end_date" IS NULL OR "student_tuition_assignment"."end_date" >= "student_tuition_assignment"."start_date")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"due_amount" numeric(10, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_period_month_valid" CHECK ("invoice"."period_month" >= 1 AND "invoice"."period_month" <= 12),
	CONSTRAINT "invoice_period_range" CHECK ("invoice"."period_end" >= "invoice"."period_start"),
	CONSTRAINT "invoice_total_non_negative" CHECK ("invoice"."total" >= 0),
	CONSTRAINT "invoice_subtotal_non_negative" CHECK ("invoice"."subtotal" >= 0),
	CONSTRAINT "invoice_paid_non_negative" CHECK ("invoice"."paid_amount" >= 0),
	CONSTRAINT "invoice_paid_not_over_total" CHECK ("invoice"."paid_amount" <= "invoice"."total"),
	CONSTRAINT "invoice_due_matches" CHECK ("invoice"."due_amount" = "invoice"."total" - "invoice"."paid_amount")
);
--> statement-breakpoint
CREATE TABLE "invoice_line_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"category" "invoice_line_item_category" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"charge_start_at" date,
	"charge_end_at" date,
	"days_charged" integer,
	"days_in_month" integer,
	"is_prorated" boolean DEFAULT false NOT NULL,
	"assignment_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_line_amount_non_negative" CHECK ("invoice_line_item"."amount" > 0),
	CONSTRAINT "invoice_line_fine_no_proration" CHECK ("invoice_line_item"."category" <> 'fine' OR (
          "invoice_line_item"."charge_start_at" IS NULL
          AND "invoice_line_item"."charge_end_at" IS NULL
          AND "invoice_line_item"."days_charged" IS NULL
          AND "invoice_line_item"."days_in_month" IS NULL
          AND "invoice_line_item"."is_prorated" = false
        )),
	CONSTRAINT "invoice_line_recurring_dates" CHECK ("invoice_line_item"."category" = 'fine' OR (
          "invoice_line_item"."charge_start_at" IS NOT NULL
          AND "invoice_line_item"."charge_end_at" IS NOT NULL
          AND "invoice_line_item"."days_charged" IS NOT NULL
          AND "invoice_line_item"."days_in_month" IS NOT NULL
          AND "invoice_line_item"."charge_end_at" >= "invoice_line_item"."charge_start_at"
          AND "invoice_line_item"."days_charged" >= 1
          AND "invoice_line_item"."days_in_month" BETWEEN 28 AND 31
          AND "invoice_line_item"."days_charged" <= "invoice_line_item"."days_in_month"
        ))
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"is_late" boolean DEFAULT false NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"reference" text,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"received_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_amount_positive" CHECK ("payment"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "student_fines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"charged_at" date DEFAULT CURRENT_DATE NOT NULL,
	"billed_invoice_id" uuid,
	"billed_at" timestamp,
	"status" "student_fine_status" DEFAULT 'pending' NOT NULL,
	"created_by" text,
	"waived_by" text,
	"waived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_fine_amount_positive" CHECK ("student_fines"."amount" > 0),
	CONSTRAINT "student_fine_billed_state" CHECK ((
          "student_fines"."status" = 'pending'
          AND "student_fines"."billed_invoice_id" IS NULL
          AND "student_fines"."billed_at" IS NULL
          AND "student_fines"."waived_at" IS NULL
        ) OR (
          "student_fines"."status" = 'billed'
          AND "student_fines"."billed_invoice_id" IS NOT NULL
          AND "student_fines"."billed_at" IS NOT NULL
          AND "student_fines"."waived_at" IS NULL
        ) OR (
          "student_fines"."status" = 'waived'
          AND "student_fines"."billed_invoice_id" IS NULL
          AND "student_fines"."billed_at" IS NULL
          AND "student_fines"."waived_at" IS NOT NULL
        ))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lodging_plan" ADD CONSTRAINT "lodging_plan_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lodging_plan" ADD CONSTRAINT "lodging_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lodging_plan" ADD CONSTRAINT "lodging_plan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_lodging_plan_id_lodging_plan_id_fk" FOREIGN KEY ("lodging_plan_id") REFERENCES "public"."lodging_plan"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_document" ADD CONSTRAINT "student_document_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_document" ADD CONSTRAINT "student_document_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_document" ADD CONSTRAINT "student_document_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_plan" ADD CONSTRAINT "food_plan_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_plan" ADD CONSTRAINT "food_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "food_plan" ADD CONSTRAINT "food_plan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_room_assignment" ADD CONSTRAINT "student_room_assignment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_room_assignment" ADD CONSTRAINT "student_room_assignment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_room_assignment" ADD CONSTRAINT "student_room_assignment_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_room_assignment" ADD CONSTRAINT "student_room_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_room_assignment" ADD CONSTRAINT "student_room_assignment_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_food_assignment" ADD CONSTRAINT "student_food_assignment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_food_assignment" ADD CONSTRAINT "student_food_assignment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_food_assignment" ADD CONSTRAINT "student_food_assignment_food_plan_id_food_plan_id_fk" FOREIGN KEY ("food_plan_id") REFERENCES "public"."food_plan"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_food_assignment" ADD CONSTRAINT "student_food_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_food_assignment" ADD CONSTRAINT "student_food_assignment_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_plan" ADD CONSTRAINT "tuition_plan_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_plan" ADD CONSTRAINT "tuition_plan_teacher_id_tuition_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."tuition_teacher"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_plan" ADD CONSTRAINT "tuition_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_plan" ADD CONSTRAINT "tuition_plan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_teacher" ADD CONSTRAINT "tuition_teacher_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_teacher" ADD CONSTRAINT "tuition_teacher_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tuition_teacher" ADD CONSTRAINT "tuition_teacher_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_tuition_plan_id_tuition_plan_id_fk" FOREIGN KEY ("tuition_plan_id") REFERENCES "public"."tuition_plan"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_tuition_assignment" ADD CONSTRAINT "student_tuition_assignment_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice_line_item" ADD CONSTRAINT "invoice_line_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice_line_item" ADD CONSTRAINT "invoice_line_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_received_by_user_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_fines" ADD CONSTRAINT "student_fines_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_fines" ADD CONSTRAINT "student_fines_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_fines" ADD CONSTRAINT "student_fines_billed_invoice_id_invoice_id_fk" FOREIGN KEY ("billed_invoice_id") REFERENCES "public"."invoice"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_fines" ADD CONSTRAINT "student_fines_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_fines" ADD CONSTRAINT "student_fines_waived_by_user_id_fk" FOREIGN KEY ("waived_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organizationRole_organizationId_idx" ON "organization_role" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organizationRole_role_idx" ON "organization_role" USING btree ("role");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "lodging_plan_unique_organization_id_name" ON "lodging_plan" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "lodging_plan_index_organization_id" ON "lodging_plan" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "room_unique_organization_id_room_number" ON "room" USING btree ("organization_id","room_number");--> statement-breakpoint
CREATE INDEX "room_index_organization_id" ON "room" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "student_organizationId_idx" ON "student" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_addmissionNumber_organizationId_idx" ON "student" USING btree ("addmission_number","organization_id");--> statement-breakpoint
CREATE INDEX "student_status_idx" ON "student" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "student_document_studentId_documentType_documentSide_idx" ON "student_document" USING btree ("student_id","document_type","document_side");--> statement-breakpoint
CREATE INDEX "student_document_studentId_idx" ON "student_document" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_document_organizationId_idx" ON "student_document" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "foodplan_unique_organization_id_name" ON "food_plan" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "foodplan_index_organization_id" ON "food_plan" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_student_room_assignment" ON "student_room_assignment" USING btree ("student_id") WHERE "student_room_assignment"."status" = 'assigned' AND "student_room_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_room_bed" ON "student_room_assignment" USING btree ("room_id","bed_number") WHERE "student_room_assignment"."status" = 'assigned' AND "student_room_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_sra_org_student_status" ON "student_room_assignment" USING btree ("organization_id","student_id","status");--> statement-breakpoint
CREATE INDEX "idx_sra_room_status" ON "student_room_assignment" USING btree ("room_id","status");--> statement-breakpoint
CREATE INDEX "idx_sra_student_history" ON "student_room_assignment" USING btree ("student_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_student_food_assignment" ON "student_food_assignment" USING btree ("student_id") WHERE "student_food_assignment"."status" = 'assigned' AND "student_food_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_student_food_plan" ON "student_food_assignment" USING btree ("student_id","food_plan_id") WHERE "student_food_assignment"."status" = 'assigned' AND "student_food_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_sfa_org_student_status" ON "student_food_assignment" USING btree ("organization_id","student_id","status");--> statement-breakpoint
CREATE INDEX "idx_sfa_food_plan_status" ON "student_food_assignment" USING btree ("food_plan_id","status");--> statement-breakpoint
CREATE INDEX "idx_sfa_student_history" ON "student_food_assignment" USING btree ("student_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "tuition_plan_org_name_idx" ON "tuition_plan" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "tuition_plan_organization_id_idx" ON "tuition_plan" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "tuition_plan_teacher_id_idx" ON "tuition_plan" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "tuition_teacher_organization_id_idx" ON "tuition_teacher" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_student_tuition_assignment" ON "student_tuition_assignment" USING btree ("student_id") WHERE "student_tuition_assignment"."status" = 'assigned' AND "student_tuition_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_student_tuition_plan" ON "student_tuition_assignment" USING btree ("student_id","tuition_plan_id") WHERE "student_tuition_assignment"."status" = 'assigned' AND "student_tuition_assignment"."end_date" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_sta_org_student_status" ON "student_tuition_assignment" USING btree ("organization_id","student_id","status");--> statement-breakpoint
CREATE INDEX "idx_sta_tuition_plan_status" ON "student_tuition_assignment" USING btree ("tuition_plan_id","status");--> statement-breakpoint
CREATE INDEX "idx_sta_student_history" ON "student_tuition_assignment" USING btree ("student_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invoice_orgid_stuid_period" ON "invoice" USING btree ("organization_id","student_id","period_year","period_month") WHERE "invoice"."status" <> 'void';--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_invoice_org_number" ON "invoice" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX "idx_invoice_org_status" ON "invoice" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_invoice_org_student" ON "invoice" USING btree ("organization_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_org_period" ON "invoice" USING btree ("organization_id","period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_invoice_org_due_date" ON "invoice" USING btree ("organization_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_invoice_line_invoice" ON "invoice_line_item" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_line_org" ON "invoice_line_item" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_line_assignment" ON "invoice_line_item" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "idx_payment_invoice" ON "payment" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payment_org_student" ON "payment" USING btree ("organization_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_org_late_payment" ON "payment" USING btree ("organization_id","is_late");--> statement-breakpoint
CREATE INDEX "idx_student_fine_org_student" ON "student_fines" USING btree ("organization_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_student_fine_org_pending" ON "student_fines" USING btree ("organization_id","status","charged_at");--> statement-breakpoint
CREATE INDEX "idx_student_fine_invoice" ON "student_fines" USING btree ("billed_invoice_id");--> statement-breakpoint
CREATE VIEW "public"."student_billable_assignments" AS (
    SELECT
    "student_room_assignment"."id" as assignment_id,
    "student_room_assignment"."organization_id" as organization_id,
    "student_room_assignment"."student_id" as student_id,
    'lodging'::text as category,
    "student_room_assignment"."room_id" as source_id,
    "student_room_assignment"."lodging_amount" as monthly_amount,
    "student_room_assignment"."start_date" as start_date,
    "student_room_assignment"."end_date" as end_date,
    "student_room_assignment"."status"::text as status
    FROM "student_room_assignment"

    UNION ALL

    SELECT
    "student_food_assignment"."id" as assignment_id,
    "student_food_assignment"."organization_id" as organization_id,
    "student_food_assignment"."student_id" as student_id,
    'food'::text as category,
    "student_food_assignment"."food_plan_id" as source_id,
    "student_food_assignment"."food_amount" as monthly_amount,
    "student_food_assignment"."start_date" as start_date,
    "student_food_assignment"."end_date" as end_date,
    "student_food_assignment"."status"::text as status
    FROM "student_food_assignment"

    UNION ALL


  SELECT
    "student_tuition_assignment"."id" as assignment_id,
    "student_tuition_assignment"."organization_id" as organization_id,
    "student_tuition_assignment"."student_id" as student_id,
    'tuition'::text as category,
    "student_tuition_assignment"."tuition_plan_id" as source_id,
    "student_tuition_assignment"."tuition_amount" as monthly_amount,
    "student_tuition_assignment"."start_date" as start_date,
    "student_tuition_assignment"."end_date" as end_date,
    "student_tuition_assignment"."status"::text as status
  FROM "student_tuition_assignment"

    UNION ALL
  SELECT
    "student_fines"."id" as assignment_id,
    "student_fines"."organization_id" as organization_id,
    "student_fines"."student_id" as student_id,
    'fine'::text as category,
    "student_fines"."id" as source_id,
    "student_fines"."amount" as monthly_amount,
    "student_fines"."charged_at" as start_date,
    "student_fines"."charged_at" as end_date,
    "student_fines"."status"::text as status
  FROM "student_fines"
    
    );