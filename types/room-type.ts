export type RoomItem = {
  id: string
  roomNumber: number
  floor: number
  fans: number
  totalBeds: number // replace singleSeater, doubleSeater, totalCapacity
  attachedBathroom: boolean
  airConditioner: boolean
  lodgingPlanId: string
  lodgingPlanName: string | null
  status: string
  createdBy: string | null
  createdByName: string | null
  createdAt: Date
  updatedAt: Date
}

export type AvailableBed = {
  bedNumber: number
}

export type AvailableRoomOption = {
  id: string
  roomNumber: number
  floor: number
  totalBeds: number
  occupiedCount: number
  availableCount: number
  isFull: boolean
  attachedBathroom: boolean
  airConditioner: boolean
  lodgingPlanId: string
  lodgingPlanName: string
  monthlyPrice: string
  availableBeds: AvailableBed[]
}

export type Room = {
  roomId: string
  roomNumber: number
  floor: number
  totalBeds: number
  fans: number
  attachedBathroom: boolean
  airConditioner: boolean
  planName: string | null
  monthlyPrice: string | null
}

export type Student = {
  bedNumber: number
  studentId: string
  studentName: string
  studentProfile: string
}

export type RoomInfoWithStudents = {
  room: Room
  students: Student[]
  vacantBeds: number
  occupiedBeds: number
}
