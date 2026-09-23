import {
  bigint,
  boolean,
  check,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"



export const genderEnum = pgEnum("gender", ["male", "female", "other"])
export const studentStatusEnum = pgEnum("student_status", [
  "active",
  "inactive",
  "suspended",
  "checkedOut",
])
export const student = pgTable(
  "student",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    //student identity
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    studentPhone: text("student_phone").notNull(),
    collegeOrSchool: text("college_or_school").notNull(),
    course: text("course").notNull(),
    profileImage: text("profile_image"),
    province: text("province").notNull(),
    district: text("district").notNull(),
    city: text("city").notNull(),
    municipality: text("municipality").notNull(),
    ward: integer("ward").notNull(),

    dateOfBirth: date("date_of_birth").notNull(),
    addmissionDate: date("addmission_date").notNull(),
    addmissionNumber: text("addmission_number").notNull(),
    gender: genderEnum("gender").notNull(),
    status: studentStatusEnum("status").notNull().default("active"),

    //student parent details
    fatherName: text("father_name").notNull(),
    motherName: text("mother_name").notNull(),
    guardianPhone1: text("guardian_phone_1").notNull(),
    guardianPhone2: text("guardian_phone_2"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("student_organizationId_idx").on(table.organizationId),
    uniqueIndex("student_addmissionNumber_organizationId_idx").on(
      table.addmissionNumber,
      table.organizationId
    ),
    index("student_status_idx").on(table.status),
  ]
)

export const documentTypeEnum = pgEnum("document_type", [
  "nid",
  "transcript",
  "certificate",
  "citizenship",
  "college_id",
  "addmission_letter",
  "other",
])
export const documentSideEnum = pgEnum("document_side", [
  "front",
  "back",
  "single",
])

export const studentDocument = pgTable(
  "student_document",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => student.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileSizeMb: integer("file_size_mb").notNull(),
    documentType: documentTypeEnum("document_type").notNull(),
    documentSide: documentSideEnum("document_side").notNull(),
    path: text("path").notNull(),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("student_document_studentId_documentType_documentSide_idx").on(
      table.studentId,
      table.documentType,
      table.documentSide
    ),
    index("student_document_studentId_idx").on(table.studentId),
    index("student_document_organizationId_idx").on(table.organizationId),
  ]
)
