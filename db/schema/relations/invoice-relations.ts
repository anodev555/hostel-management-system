import { relations } from "drizzle-orm"

import { invoice, invoiceLineItem } from "../invoice-schema"
import { student } from "../student-schema"

export const studentRelations = relations(student, ({ many }) => ({
  invoices: many(invoice),
}))

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  student: one(student, {
    fields: [invoice.studentId],
    references: [student.id],
  }),
  lineItems: many(invoiceLineItem),
}))

export const invoiceLineItemRelations = relations(
  invoiceLineItem,
  ({ one }) => ({
    invoice: one(invoice, {
      fields: [invoiceLineItem.invoiceId],
      references: [invoice.id],
    }),
  })
)
