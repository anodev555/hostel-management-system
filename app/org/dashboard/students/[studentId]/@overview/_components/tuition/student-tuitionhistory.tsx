"use client"

import { useEffect, useState } from "react"
import {
  getStudentRoomHistory,
  getStudentTuitionHistory,
} from "../../action/student-overview"
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
import { StudentTuitionHistoryItem } from "@/types/tuition-types"
import { TuitionHistorySkeleton } from "./tuition-skeleton"

export default function StudentTuitionHistory({
  studentId,
  refreshKey,
}: {
  studentId: string
  refreshKey: number
}) {
  const [tuitionHistory, setTuitionHistory] = useState<
    StudentTuitionHistoryItem[]
  >([])
  const [tuitionHistoryLoading, setTuitionHistoryLoading] = useState(false)

  useEffect(() => {
    setTuitionHistoryLoading(true)
    let cancelled = false

    async function getTuitionHistory() {
      try {
        const response = await getStudentTuitionHistory({ studentId })
        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setTuitionHistory(response.data)
        setTuitionHistoryLoading(false)
      } catch (error) {
        if (cancelled) return

        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      } finally {
        if (cancelled) return
        setTuitionHistoryLoading(false)
      }
    }

    getTuitionHistory()

    return () => {
      cancelled = true
    }
  }, [studentId, refreshKey])

  return (
    <div>
      {tuitionHistoryLoading ? (
        <TuitionHistorySkeleton />
      ) : tuitionHistory.length > 0 ? (
        <div className="mt-2 max-h-75 overflow-y-auto">
          <p className="m-1 text-sm font-bold">Tuition History</p>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Tuition Plan Name</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Tuition Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Released By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tuitionHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tuitionPlanName}</TableCell>
                  <TableCell>{item.teacherName}</TableCell>
                  <TableCell>{item.tuitionAmount}</TableCell>
                  <TableCell>{item.startDate}</TableCell>
                  <TableCell>{item.endDate}</TableCell>
                  <TableCell>{item.assignedBy}</TableCell>
                  <TableCell>{item.releasedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-2">
          <h1 className="text-1xl font-bold">No Tuition History Found</h1>
          <p className="text-sm text-gray-500">
            This student has not been assigned or released from any tuition yet.
          </p>
        </div>
      )}
    </div>
  )
}
