export type TuitionPlanListItem = {
  id: string
  name: string
  monthlyPrice: string
  status: string
  teacherId: string
  teacherName: string
  teacherPhone: string | null
  teacherSubject: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: string | null
  updatedBy: string | null
}

export type TuitionPlanDetail = TuitionPlanListItem & {
  createdByName?: string | null
  teacherEmail: string | null
  teacherAddress: string | null
  status: string
}

export type ActiveTuitionPlanOption = {
  id: string
  name: string
  monthlyPrice: string
  teacherName: string
  teacherSubject: string | null
}

export type StudentTuitionHistoryItem = {
  id: string
  tuitionPlanName: string
  teacherName: string | null
  tuitionAmount: string
  startDate: string
  endDate: string | null
  assignedBy: string | null
  releasedBy: string | null
}

export type GroupedTuitionPlan = {
  tuitionPlanId: string
  tuitionPlanName: string
  teacherName: string
  subjects: string
  monthlyFee: string
  teacherPhone: string
  teacherAddress: string
  students: {
    studentId: string
    studentName: string
    studentProfileImage: string
    studentPhone: string
  }[]
}
