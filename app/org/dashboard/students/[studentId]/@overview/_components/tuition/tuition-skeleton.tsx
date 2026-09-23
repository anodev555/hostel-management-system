"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

export default function TuitionFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tuition</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div>
          <FieldSet>
            <FieldLegend>Tuition Plan</FieldLegend>
            <FieldGroup>
              <Skeleton className="h-7 w-full rounded-lg" />
            </FieldGroup>
          </FieldSet>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function TuitionHistorySkeleton() {
  const tuitionHistory = Array.from({ length: 3 })
  return (
    <div className="mt-2 max-h-75 overflow-y-auto">
      <p className="m-1 text-sm font-bold">Tuition Allocation History</p>
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
          {tuitionHistory.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
