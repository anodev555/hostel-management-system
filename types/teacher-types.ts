export type TeacherListItem = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  subject: string | null
  status: string
  planCount: number
  createdAt: Date
}

export type GetTeachersResponse = {
  teachers: TeacherListItem[]
  total: number
  totalPages: number
}

export type TeacherPlanPayroll = {
  planId: string
  planName: string
  planStatus: string
  payeeType: string
  monthlyAmount: string | null
  contractStatus: string
  effectiveFrom: string
}

export type TeacherDetail = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  subject: string | null
  address: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  createdByName: string | null
  monthlySalary: string | null
  plans: TeacherPlanPayroll[]
}

export type ActiveTeacherOption = {
  id: string
  fullName: string
  subject: string | null
  phone: string | null
}
