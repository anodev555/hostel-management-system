import { relations } from "drizzle-orm"
import { member, user } from "../auth-schema"
import { tuitionTeacher } from "../tuition-schema"
import {
  payrollContract,
  payrollInvoice,
  payrollInvoiceLineItem,
  payrollPayment,
} from "../payroll-schema"

export const payrollContractRelations = relations(
  payrollContract,
  ({ one, many }) => ({
    member: one(member, {
      fields: [payrollContract.memberId],
      references: [member.id],
    }),
    teacher: one(tuitionTeacher, {
      fields: [payrollContract.teacherId],
      references: [tuitionTeacher.id],
    }),
    lineItems: many(payrollInvoiceLineItem),
  })
)

export const payrollInvoiceRelations = relations(
  payrollInvoice,
  ({ one, many }) => ({
    member: one(member, {
      fields: [payrollInvoice.memberId],
      references: [member.id],
    }),
    teacher: one(tuitionTeacher, {
      fields: [payrollInvoice.teacherId],
      references: [tuitionTeacher.id],
    }),
    lineItems: many(payrollInvoiceLineItem),
    payments: many(payrollPayment),
  })
)

export const payrollInvoiceLineItemRelations = relations(
  payrollInvoiceLineItem,
  ({ one }) => ({
    invoice: one(payrollInvoice, {
      fields: [payrollInvoiceLineItem.payrollInvoiceId],
      references: [payrollInvoice.id],
    }),
    contract: one(payrollContract, {
      fields: [payrollInvoiceLineItem.contractId],
      references: [payrollContract.id],
    }),
  })
)

export const payrollPaymentRelations = relations(payrollPayment, ({ one }) => ({
  invoice: one(payrollInvoice, {
    fields: [payrollPayment.payrollInvoiceId],
    references: [payrollInvoice.id],
  }),
  member: one(member, {
    fields: [payrollPayment.memberId],
    references: [member.id],
  }),
  teacher: one(tuitionTeacher, {
    fields: [payrollPayment.teacherId],
    references: [tuitionTeacher.id],
  }),
  collectedByUser: one(user, {
    fields: [payrollPayment.collectedBy],
    references: [user.id],
  }),
}))