"use client"

import { Search } from "lucide-react"

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function RoleListSkeleton() {
  const rows = Array.from({ length: 10 }, (_, index) => index)

  return (
    <>
      <InputGroup
        aria-hidden
        className={cn("pointer-events-none max-w-md rounded-xl")}
      >
        <InputGroupAddon align="inline-start">
          <Search className="text-muted-foreground/40" />
        </InputGroupAddon>
        <div className="flex flex-1 items-center px-2">
          <Skeleton className="h-3.5 w-40" />
        </div>
      </InputGroup>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="text-sm font-medium capitalize">
                  <Skeleton className="inline-block h-4 w-20" />
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-muted-foreground">
                  <Skeleton className="inline-block h-4 w-28" />
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-muted-foreground">
                  <Skeleton className="inline-block h-4 w-32" />
                </span>
              </TableCell>
              <TableCell>
                <Skeleton className="h-7 w-9 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
