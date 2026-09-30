"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { SearchBar } from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StatusSwitch from "@/app/org/dashboard/_components/status-switch"
import { usePermissions } from "@/lib/permissions/usePermissions"
import type { TuitionPlanListItem } from "@/types/tuition-types"

import { updateTuitionStatusAction } from "../action/tuition"
import TuitionHeader from "./tuition-header"

function TuitionStatusCell({ plan }: { plan: TuitionPlanListItem }) {
  const { hasPermission } = usePermissions()
  const [isPending, setIsPending] = useState(false)
  const [isActive, setIsActive] = useState(plan.status === "active")

  async function handleToggle(checked: boolean) {
    if (isPending) return
    const nextStatus = checked ? "active" : "inactive"
    const previous = isActive
    setIsActive(checked)
    setIsPending(true)
    try {
      const response = await updateTuitionStatusAction({
        tuitionPlanId: plan.id,
        status: nextStatus,
      })
      if (response.success) {
        toast.success(response.message ?? `Tuition plan marked as ${nextStatus}`)
      } else {
        setIsActive(previous)
        toast.error(response.message ?? "Failed to update tuition plan status")
      }
    } catch (error) {
      setIsActive(previous)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update tuition plan status"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <Badge variant="outline" className="bg-green-500 text-white">
          Active
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-500 text-white">
          Inactive
        </Badge>
      )}
      {hasPermission("tuition", "update") && (
        <StatusSwitch
          checked={isActive}
          pending={isPending}
          activeLabel="Mark tuition plan inactive"
          inactiveLabel="Mark tuition plan active"
          onToggle={handleToggle}
        />
      )}
    </div>
  )
}

export default function TuitionList({
  tuitionPlans,
}: {
  tuitionPlans: TuitionPlanListItem[]
}) {
  const router = useRouter()
  const { hasPermission } = usePermissions()

  return (
    <div className="flex flex-col gap-4">
      <TuitionHeader />

      <div className="flex flex-col gap-2">
        <SearchBar
          param="search"
          placeholder="Search tuition plan"
          className="w-full max-w-md"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan name</TableHead>
              <TableHead>Monthly price</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tuitionPlans.length > 0 ? (
              tuitionPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  onClick={() => {
                    if (hasPermission("tuition", "update")) {
                      router.push(`/org/dashboard/setting/tuitionplan/${plan.id}`)
                    }
                  }}
                >
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.monthlyPrice}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{plan.teacherName}</span>
                      {plan.teacherPhone ? (
                        <span className="text-xs text-muted-foreground">
                          {plan.teacherPhone}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{plan.teacherSubject || "—"}</TableCell>
                  <TableCell>
                    <TuitionStatusCell plan={plan} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tuition plans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
