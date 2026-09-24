export type StaffItem = {
  id: string
  createdAt: Date
  staffName: string | null
  staffUsername: string | null
  staffRole: string
  staffPhone: string | null
  staffImage: string | null
  isActive: boolean
}

export type StaffSalaryContract = {
  id: string
  monthlyAmount: string | null
  effectiveFrom: string
  effectiveTo: string | null
  status: "active" | "inactive"
}

export type StaffDetail = {
  id: string
  createdAt: Date
  userId: string
  staffId: string
  name: string | null
  username: string | null
  role: string
  phone: string | null
  email: string | null
  displayUsername: string | null
  image: string | null
  salary: string | null
}

export type StaffData = {
  staffDetail: StaffDetail
  salaryHistory: StaffSalaryContract[] | null
}
