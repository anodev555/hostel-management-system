"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table"

export default function BillingSkeleton() {
  const bills = Array.from({ length: 3 })
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>
              <Skeleton className="h-6 w-20" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-40" />
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-md border p-4"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-10 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>

                <Skeleton className="h-6 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader className="bg-muted-background">
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {bills.length > 0 ? (
            bills.map((bill, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="font-bold text-gray-500">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="font-bold text-green-500">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="font-bold text-red-500">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No bills Available. All Bills are Paid!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
