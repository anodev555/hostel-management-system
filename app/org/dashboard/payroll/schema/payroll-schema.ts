import { z } from "zod"

export const PAYROLL_PAYEE_TYPES = ["staff", "teacher"] as const
export const PAYROLL_STATUSES = [
  "unpaid",
  "paid",
  "partial",
  "void",
] as const
export const PAYMENT_METHODS = [
  "cash",
  "esewa",
  "bank_transfer",
  "cheque",
  "khalti",
  "other",
] as const
export const DEDUCTION_REASONS = ["advance", "loan", "fine", "other"] as const

const amountString = z
  .string()
  .min(1, "Amount is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimals")

export const PAYROLL_LIST_STATUSES = [
  "outstanding",
  "unpaid",
  "partial",
  "paid",
  "all",
] as const

export const getPayrollInvoicesSchema = z.object({
  payeeType: z.enum(PAYROLL_PAYEE_TYPES).optional(),
  status: z.enum(PAYROLL_LIST_STATUSES).optional().default("outstanding"),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(20).optional(),
})
export type GetPayrollInvoicesSchemaType = z.infer<
  typeof getPayrollInvoicesSchema
>

export const getPayrollInvoiceDetailSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
})
export type GetPayrollInvoiceDetailSchemaType = z.infer<
  typeof getPayrollInvoiceDetailSchema
>

export const getPayrollEmployeeDetailSchema = z.object({
  payeeType: z.enum(PAYROLL_PAYEE_TYPES),
  payeeId: z.string().trim().min(1, "Employee is required").max(100),
})
export type GetPayrollEmployeeDetailSchemaType = z.infer<
  typeof getPayrollEmployeeDetailSchema
>

export const collectEmployeePaymentSchema = z.object({
  payeeType: z.enum(PAYROLL_PAYEE_TYPES),
  payeeId: z.string().trim().min(1, "Employee is required").max(100),
  amount: amountString,
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
  receivedBy: z.string().trim().max(200).optional(),
})
export type CollectEmployeePaymentSchemaType = z.infer<
  typeof collectEmployeePaymentSchema
>

export const collectPayrollPaymentSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
  amount: amountString,
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
  receivedBy: z.string().trim().max(200).optional(),
})
export type CollectPayrollPaymentSchemaType = z.infer<
  typeof collectPayrollPaymentSchema
>

export const addPayrollDeductionSchema = z.object({
  payrollInvoiceId: z.uuid("Invalid invoice ID"),
  reason: z.enum(DEDUCTION_REASONS),
  description: z.string().trim().max(300).optional(),
  amount: amountString,
})
export type AddPayrollDeductionSchemaType = z.infer<
  typeof addPayrollDeductionSchema
>

export const updatePayrollDeductionSchema = z.object({
  deductionId: z.uuid("Invalid deduction ID"),
  reason: z.enum(DEDUCTION_REASONS),
  description: z.string().trim().max(300).optional(),
  amount: amountString,
})
export type UpdatePayrollDeductionSchemaType = z.infer<
  typeof updatePayrollDeductionSchema
>

export const deletePayrollDeductionSchema = z.object({
  deductionId: z.uuid("Invalid deduction ID"),
})
export type DeletePayrollDeductionSchemaType = z.infer<
  typeof deletePayrollDeductionSchema
>

export const updatePayrollPayoutSchema = z.object({
  payoutId: z.uuid("Invalid payout ID"),
  amount: amountString,
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
  receivedBy: z.string().trim().max(200).optional(),
})
export type UpdatePayrollPayoutSchemaType = z.infer<
  typeof updatePayrollPayoutSchema
>

export const deletePayrollPayoutSchema = z.object({
  payoutId: z.uuid("Invalid payout ID"),
})
export type DeletePayrollPayoutSchemaType = z.infer<
  typeof deletePayrollPayoutSchema
>

export const voidPayrollInvoiceSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
})
export type VoidPayrollInvoiceSchemaType = z.infer<
  typeof voidPayrollInvoiceSchema
>