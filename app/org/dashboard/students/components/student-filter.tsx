"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { studentStatusEnum } from "@/db/schema/student-schema"
import { cn } from "@/lib/utils"

const ALL_STATUSES = "all"

const statusLabels: Record<
  (typeof studentStatusEnum.enumValues)[number],
  string
> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  checkedOut: "Checked out",
}

type StudentFilterProps = {
  param?: string
  className?: string
}

export default function StudentFilter({
  param = "status",
  className,
}: StudentFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get(param)
  const selectValue =
    currentStatus &&
    studentStatusEnum.enumValues.includes(
      currentStatus as (typeof studentStatusEnum.enumValues)[number]
    )
      ? currentStatus
      : ALL_STATUSES

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value === ALL_STATUSES) {
      params.delete(param)
    } else {
      params.set(param, value)
    }

    params.set("page", "1")

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <Select value={selectValue} onValueChange={handleStatusChange}>
      <SelectTrigger className={cn("w-full min-w-40 rounded-xl", className)}>
        <SelectValue placeholder="Filter by status" className="text-sm" />
      </SelectTrigger>
      <SelectContent className="p-2">
        <SelectItem value={ALL_STATUSES}>All Status</SelectItem>
        {studentStatusEnum.enumValues.map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
