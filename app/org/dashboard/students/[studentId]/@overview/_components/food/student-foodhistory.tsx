"use client"

import { useEffect, useState } from "react"
import {
  getStudentFoodHistory,
  getStudentRoomHistory,
} from "../../action/student-overview"
import {
  StudentFoodHistoryItem,
  StudentRoomHistoryItem,
} from "@/types/student-type"
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
import { FoodHistorySkeleton } from "./food-skeleton"

export default function StudentFoodHistory({
  studentId,
  refreshKey,
}: {
  studentId: string
  refreshKey: number
}) {
  const [foodHistory, setFoodHistory] = useState<StudentFoodHistoryItem[]>([])
  const [foodHistoryLoading, setFoodHistoryLoading] = useState(false)

  useEffect(() => {
    setFoodHistoryLoading(true)
    let cancelled = false

    async function getFoodHistory() {
      try {
        const response = await getStudentFoodHistory({ studentId })
        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setFoodHistory(response.data)
        setFoodHistoryLoading(false)
      } catch (error) {
        if (cancelled) return

        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      } finally {
        if (cancelled) return
        setFoodHistoryLoading(false)
      }
    }

    getFoodHistory()

    return () => {
      cancelled = true
    }
  }, [studentId, refreshKey])

  return (
    <div>
      {foodHistoryLoading ? (
        <FoodHistorySkeleton />
      ) : foodHistory.length > 0 ? (
        <div className="mt-2 max-h-75 overflow-y-auto">
          <p className="m-1 text-sm font-bold">Food Allocation History</p>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Food Plan Name</TableHead>

                <TableHead>Food Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Released By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.foodPlanName}</TableCell>
                  <TableCell>{item.foodAmount}</TableCell>
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
          <h1 className="text-1xl font-bold">No Food History Found</h1>
          <p className="text-sm text-gray-500">
            This student has not been assigned or released from any food yet.
          </p>
        </div>
      )}
    </div>
  )
}
