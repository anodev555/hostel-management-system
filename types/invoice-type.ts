export type StudentRow = {
  id: string
  fullName: string
  profileImage: string | null
}

export type InvoiceLineItemRow = {
  id: string
  invoiceId: string
  category: "tuition" | "lodging" | "food" | "fine"
  amount: string
  description: string
  chargeStartAt: string | null
  chargeEndAt: string | null
  daysCharged: number | null
  daysInMonth: number | null
  isProrated: boolean
}

export type InvoiceRow = {
  id: string
  invoiceNumber: string
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
  status: "unpaid" | "paid" | "partial" | "void"
  notes: string | null
  isOverDue: boolean
  lineItems: InvoiceLineItemRow[]
}

export type GetInvoicesPerStudentResponse = {
  student: StudentRow
  summary: InvoiceSummary
  invoices: InvoiceRow[]
}
export type InvoiceSummary = {
  totalBilled: string
  totalPaid: string
  totalDue: string
  overDueCount: number
  totalCount: number
  totalPages: number
}
