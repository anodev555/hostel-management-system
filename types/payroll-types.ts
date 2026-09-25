export type PayrollPayeeType = "staff" | "teacher"

export type PayrollInvoiceStatus = "unpaid" | "paid" | "partial" | "void"

export type PayrollPaymentMethod =
  | "cash"
  | "esewa"
  | "bank_transfer"
  | "cheque"
  | "khalti"
  | "other"

export type PayrollDeductionReason = "advance" | "loan" | "fine" | "other"

export type PayrollInvoiceRow = {
  id: string
  invoiceNumber: string
  payeeType: PayrollPayeeType
  payeeId: string
  payeeName: string
  payeeImage: string | null
  payeeRole: string | null
  periodYear: number
  periodMonth: number
  periodStart: string
  periodEnd: string
  issuedAt: Date
  dueDate: string
  subTotal: string
  deductionTotal: string
  total: string
  paidAmount: string
  dueAmount: string
  status: PayrollInvoiceStatus
  lineItemsCount: number
  payoutCount: number
  isOverDue: boolean
}

export type PayrollSummary = {
  totalBilled: string
  totalPaid: string
  totalDue: string
  paidCount: number
  pendingCount: number
  totalCount: number
  totalPages: number
}

export type PayrollEmployeeStatus = "unpaid" | "partial" | "paid"

export type PayrollEmployeeRow = {
  payeeType: PayrollPayeeType
  payeeId: string
  payeeName: string
  payeeImage: string | null
  payeeRole: string | null
  totalGross: string
  deductionTotal: string
  totalNet: string
  totalPaid: string
  totalRemaining: string
  outstandingCount: number
  paidCount: number
  totalInvoices: number
  status: PayrollEmployeeStatus
  isOverDue: boolean
}

export type GetPayrollInvoicesResponse = {
  summary: PayrollSummary
  employees: PayrollEmployeeRow[]
}

export type PayrollEmployeeInvoiceRow = {
  id: string
  invoiceNumber: string
  periodYear: number
  periodMonth: number
  periodStart: string
  periodEnd: string
  issuedAt: Date
  dueDate: string
  subTotal: string
  deductionTotal: string
  total: string
  paidAmount: string
  dueAmount: string
  status: PayrollInvoiceStatus
  payoutCount: number
  isOverDue: boolean
}

export type PayrollEmployeePayoutRow = PayrollPayoutRow & {
  invoiceId: string
  invoiceNumber: string
  periodYear: number
  periodMonth: number
}

export type PayrollEmployeeDetail = {
  payeeType: PayrollPayeeType
  payee: PayrollPayeeInfo
  summary: {
    totalGross: string
    totalDeductions: string
    totalNet: string
    totalPaid: string
    totalRemaining: string
    outstandingCount: number
    paidCount: number
  }
  outstanding: PayrollEmployeeInvoiceRow[]
  completed: PayrollEmployeeInvoiceRow[]
  payouts: PayrollEmployeePayoutRow[]
}

export type PayrollPayeeInfo = {
  id: string
  name: string
  image: string | null
  /** staff: member role · teacher: subject */
  role: string | null
  phone: string | null
  email: string | null
  activeContractAmount: string | null
}

export type PayrollLineItemRow = {
  id: string
  description: string
  amount: string
  chargeStartAt: string | null
  chargeEndAt: string | null
  daysCharged: number | null
  daysInMonth: number | null
  isProrated: boolean
}

export type PayrollDeductionRow = {
  id: string
  reason: PayrollDeductionReason
  description: string | null
  amount: string
  createdByName: string | null
  createdAt: Date
  updatedAt: Date
}

export type PayrollPayoutRow = {
  id: string
  amount: string
  method: PayrollPaymentMethod
  reference: string | null
  notes: string | null
  paidAt: Date
  receivedBy: string | null
  collectedByName: string | null
}

export type PayrollInvoiceDetail = {
  invoice: {
    id: string
    invoiceNumber: string
    payeeType: PayrollPayeeType
    periodYear: number
    periodMonth: number
    periodStart: string
    periodEnd: string
    issuedAt: Date
    dueDate: string
    subTotal: string
    total: string
    paidAmount: string
    dueAmount: string
    status: PayrollInvoiceStatus
    notes: string | null
  }
  payee: PayrollPayeeInfo
  lineItems: PayrollLineItemRow[]
  deductions: PayrollDeductionRow[]
  payouts: PayrollPayoutRow[]
}