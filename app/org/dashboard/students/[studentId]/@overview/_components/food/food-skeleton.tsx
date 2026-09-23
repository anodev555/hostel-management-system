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

export default function FoodFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Food Plan</CardTitle>
        <CardDescription>Assign a food plan to the student.</CardDescription>
      </CardHeader>
      <CardContent className="">
        <div>
          <FieldSet>
            <FieldLegend>Food Plan</FieldLegend>
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

export function FoodHistorySkeleton() {
  const roomHistory = Array.from({ length: 3 })
  return (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
