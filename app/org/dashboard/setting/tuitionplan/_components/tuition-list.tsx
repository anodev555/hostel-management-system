"use client"

import { PencilIcon } from "lucide-react"
import Link from "next/link"

import { SearchBar } from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TuitionPlanListItem } from "@/types/tuition-types"

import TuitionHeader from "./tuition-header"

export default function TuitionList({
  tuitionPlans,
}: {
  tuitionPlans: TuitionPlanListItem[]
}) {
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tuitionPlans.length > 0 ? (
              tuitionPlans.map((plan) => (
                <TableRow key={plan.id}>
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
                    {plan.status === "active" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500 text-white"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500 text-white"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/org/dashboard/setting/tuitionplan/${plan.id}`}
                    >
                      <Button variant="default" size="icon">
                        <PencilIcon className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
