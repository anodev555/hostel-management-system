export type StudentDocument = {
  id: string
  studentId: string
  organizationId: string
  documentType: string
  documentSide: string
  path: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  updatedAt: Date | null
}

export type StudentListItem = {
  id: string
  name: string
  college: string
  profileImageUrl: string | null
  addmissionDate: string
  course: string
  gender: string
  status: string
  phoneNumber: string
  roomNumber: number | null
  tuitionPlan: string | null
}

export type StudentOverviewItem = {
  student: {
    id: string
    fullName: string
    email: string
    studentPhone: string
    collegeOrSchool: string
    course: string
    profileImage: string | null
    province: string
    district: string
    city: string
    municipality: string
    ward: number
    dateOfBirth: string
    addmissionDate: string
    addmissionNumber: string
    gender: string
    status: string
    fatherName: string
    motherName: string
    guardianPhone1: string
    guardianPhone2: string | null
  }
  room: {
    roomNumber: number | null
    floor: number | null
    lodgingPlanName: string
    bedNumber: number
    monthlyFee: string
    startDate: string
    endDate: string | null
  } | null
  food: {
    planName: string
    monthlyFee: string
    startDate: string
    endDate: string | null
  } | null
  tuition: {
    planName: string
    teacherName: string | null
    monthlyFee: string
    startDate: string
    endDate: string | null
    teacherSubject: string | null
  } | null
}

export type StudentRoomHistoryItem = {
  id: string
  roomNumber: number | null
  floor: number | null
  bedNumber: number | null
  lodgingPlanName: string | null
  lodgingAmount: string | null
  startDate: string
  endDate: string | null
  releasedAt: Date | null
  releasedBy: string | null
}

export type StudentFoodHistoryItem = {
  id: string
  foodPlanName: string
  foodAmount: string
  startDate: string
  endDate: string | null
  assignedBy: string | null
  releasedBy: string | null
}
