export type VisitorRow = {
  id: string
  visitorName: string
  relation: string
  age: number | null
  expectedVisitDuration: string | null
  studentId: string | null
  studentName: string
  reason: string
  checkinAt: Date
  checkoutAt: Date | null
  visitDate: string
  createdBy: string | null
  checkoutBy: string | null
}

export type GetAllVisitorsResponse = {
  visitors: VisitorRow[]
  totalPages: number
  total: number
  insideCount: number
}

export type VisitorStudentOption = {
  id: string
  fullName: string
}
