"use client"

import { LodgingItem } from "@/types/lodging-types"
import LodgingHeader from "./lodging-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function LodgingList({ data }: { data: LodgingItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      <LodgingHeader />

      <div className="flex flex-col gap-4">
        <SearchBar
          param="search"
          placeholder="Search by name"
          className="max-w-md"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Monthly Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.monthlyPrice}</TableCell>
                  <TableCell>
                    {item.status === "active" ? (
                      <Badge
                        variant="default"
                        className="bg-green-500 text-white"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-red-500 text-white"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.createdByName}</TableCell>
                  <TableCell>
                    {item.createdAt.toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/org/dashboard/setting/lodging/${item.id}`}>
                      <Button variant="default" size="icon">
                        <PencilIcon className="size-4" />
                      </Button>{" "}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
