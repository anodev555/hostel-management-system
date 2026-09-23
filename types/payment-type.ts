export type RecentPayments = {
  id: string
  invoiceId: string
  organizationId: string
  studentId: string
  isLate: boolean
  amount: string
  method: "other" | "cash" | "esewa" | "bank_transfer" | "cheque" | "khalti"
  reference: string | null
  paidAt: Date
  notes: string | null
  receivedBy: string | null
  collectedBy: string | null
  createdAt: Date
}

export type PaymentStudentRow = {
  id: string
  fullName: string
  profileImage: string | null
}

export type PaymentHistoryRow = {
  id: string
  invoiceId: string
  invoiceNumber: string
  periodYear: number
  periodMonth: number
  amount: string
  method: "cash" | "esewa" | "bank_transfer" | "cheque" | "khalti" | "other"
  reference: string | null
  notes: string | null
  receivedBy: string | null
  collectedBy: string | null
  collectedByName: string | null
  isLate: boolean
  paidAt: Date
  createdAt: Date
}

export type PaymentSummary = {
  totalCollected: string
  paymentCount: number
  latePaymentCount: number
  totalPages: number
}

export type GetPaymentsPerStudentResponse = {
  student: PaymentStudentRow
  summary: PaymentSummary
  payments: PaymentHistoryRow[]
}
