"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function RoomFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Room</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <FieldSet className="w-full sm:basis-1/2">
            <FieldGroup>
              <span>Room</span>
              <Skeleton className="h-7 w-full rounded-lg" />
              <span>Bed</span>
              <Skeleton className="h-7 w-full rounded-lg" />
            </FieldGroup>
          </FieldSet>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row gap-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function RoomHistorySkeleton() {
  const roomHistory = Array.from({ length: 3 })
  return (
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
          {roomHistory.map((item, index) => (
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
