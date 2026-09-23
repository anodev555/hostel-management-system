"use client"

import { useEffect, useState } from "react"
import { getStudentRoomHistory } from "../../action/student-overview"
import { StudentRoomHistoryItem } from "@/types/student-type"
import { toast } from "sonner"
import LoadingBar from "@/components/loading-bar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoomHistorySkeleton } from "./room-skeleton"

export default function StudentRoomHistory({
  studentId,
  refreshKey,
}: {
  studentId: string
  refreshKey: number
}) {
  const [roomHistory, setRoomHistory] = useState<StudentRoomHistoryItem[]>([])
  const [roomHistoryLoading, setRoomHistoryLoading] = useState(false)

  useEffect(() => {
    setRoomHistoryLoading(true)
    let cancelled = false

    async function getRoomHistory() {
      try {
        const response = await getStudentRoomHistory({ studentId })
        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setRoomHistory(response.data)
        setRoomHistoryLoading(false)
      } catch (error) {
        if (cancelled) return

        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      } finally {
        if (cancelled) return
        setRoomHistoryLoading(false)
      }
    }

    getRoomHistory()

    return () => {
      cancelled = true
    }
  }, [studentId, refreshKey])

  return (
    <div>
      {roomHistoryLoading ? (
        <RoomHistorySkeleton />
      ) : roomHistory.length > 0 ? (
        <div className="mt-2 max-h-75 overflow-y-auto">
          <p className="m-1 text-sm font-bold">Room Allocation History</p>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>

                <TableHead>Bed Number</TableHead>
                <TableHead>Lodging Plan Name</TableHead>
                <TableHead>Lodging Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Released By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.roomNumber}</TableCell>

                  <TableCell>{item.bedNumber}</TableCell>
                  <TableCell>{item.lodgingPlanName}</TableCell>
                  <TableCell>{item.lodgingAmount}</TableCell>
                  <TableCell>{item.startDate}</TableCell>
                  <TableCell>{item.endDate}</TableCell>

                  <TableCell>{item.releasedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-2">
          <h1 className="text-1xl font-bold">No Room History Found</h1>
          <p className="text-sm text-gray-500">
            This student has not been assigned or released from any room yet.
          </p>
        </div>
      )}
    </div>
  )
}
