"use client"

import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table"
import { PencilIcon } from "lucide-react"
import router from "next/router"
import { Avatar } from "radix-ui"

export default function StaffListSkeleton() {
  const staffs = Array.from({ length: 7 })
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 max-w-md" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffs.length > 0 ? (
            staffs.map((staff, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <span className="text-sm font-medium capitalize">
                      <Skeleton className="h-4 w-24" />
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-7 w-7" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No staff found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
