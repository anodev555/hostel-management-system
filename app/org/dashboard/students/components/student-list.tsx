"use client"

import { StudentListItem } from "@/types/student-type"
import React from "react"
import StudentHeader from "./student-header"
import { SearchBar } from "@/components/search-bar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { PaginationControls } from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
import StudentFilter from "./student-filter"
import { Check, X } from "lucide-react"
import { usePermissions } from "@/lib/permissions/usePermissions"

function StudentStatus({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-500 text-white capitalize">
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500 text-white capitalize"
        >
          Inactive
        </Badge>
      )
    case "suspended":
      return (
        <Badge variant="outline" className="bg-red-500 text-white capitalize">
          Suspended
        </Badge>
      )
    case "checkedOut":
      return (
        <Badge variant="outline" className="bg-gray-500 text-white capitalize">
          Checked Out
        </Badge>
      )
  }
}

function formatAdmissionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export default function StudentList({
  students,
  total,
  totalPages,
}: {
  students: StudentListItem[]
  total: number
  totalPages: number
}) {
  const router = useRouter()
  const {hasPermission} = usePermissions()
  return (
    <div className="space-y-6">
      <StudentHeader />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          param="search"
          placeholder="Search students or admission number"
          className="max-w-md flex-1"
        />
        <StudentFilter className="sm:w-44" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Room No.</TableHead>
            <TableHead>Tuition</TableHead>
            <TableHead>Addmission Date</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow
                onClick={() => {
                  if (hasPermission("student", "read")) {
                    router.push(`/org/dashboard/students/${student.id}`)
                  }
                }}
                key={student.id}
              >
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <Avatar className="size-13">
                      <AvatarImage src={`/${student.profileImageUrl ?? ""}`} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.college} | {student.course}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.roomNumber ?? "-"}</TableCell>
                <TableCell>
                  {student.tuitionPlan ? (
                    <Check className="size-6 text-green-500" />
                  ) : (
                    <X className="size-6 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  {formatAdmissionDate(student.addmissionDate)}
                </TableCell>
                <TableCell className="capitalize">{student.gender}</TableCell>
                <TableCell className="capitalize">
                  <StudentStatus status={student.status} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {" "}
                No Students Found!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationControls totalPages={totalPages} />
    </div>
  )
}
