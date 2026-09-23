export type billRowsType = {
  isOverDue: boolean
  id: string
  organizationId: string
  studentId: string
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
  createdAt: Date
  updatedAt: Date
}

// organization billing — one open invoice (unpaid or partial)
export type OrgBillingOpenInvoice = {
  invoiceId: string
  invoiceNumber: string
  periodYear: number
  periodMonth: number
  status: "unpaid" | "partial"
  total: string
  paidAmount: string
  dueAmount: string
  dueDate: string
  isOverDue: boolean
}

// one student in the org billing list
export type OrgBillingStudentRow = {
  studentId: string
  fullName: string
  studentProfile: string | null
  totalDue: string
  overDue: string
  openInvoiceCount: number
  overdueInvoiceCount: number
  oldestDueDate: string | null
  openInvoices: OrgBillingOpenInvoice[]
}

export type OrgBillingSummary = {
  totalOutstanding: string
  overdueTotal: string
  studentsWithDue: number
  overdueInvoiceCount: number
}

export type GetOrgBillingResponse = {
  summary: OrgBillingSummary
  students: OrgBillingStudentRow[]
  totalPages: number
}
