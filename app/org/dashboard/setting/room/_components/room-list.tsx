"use client"

import React from "react"
import RoomHeader from "./room-header"
import { SearchBar } from "@/components/search-bar"
import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { RoomItem } from "@/types/room-type"
import { PaginationControls } from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PencilIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoomList({
  rooms,
  total,
  totalPages,
}: {
  rooms: RoomItem[]
  total: number
  totalPages: number
}) {
  return (
    <div className="flex flex-col gap-4">
      <RoomHeader />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <SearchBar
            param="search"
            placeholder="Search room number"
            className="max-w-md"
          />
          <span className="text-sm text-gray-500">Total rooms: {total}</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Floor</TableHead>

              <TableHead>Total Beds</TableHead>
              <TableHead>Lodging Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.floor}</TableCell>

                  <TableCell>{room.totalBeds}</TableCell>
                  <TableCell>{room.lodgingPlanName}</TableCell>
                  <TableCell>
                    {room.status === "active" ? (
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
                  <TableCell>
                    <Link href={`/org/dashboard/setting/room/${room.id}`}>
                      <Button variant="default" size="icon">
                        <PencilIcon className="size-4" />
                      </Button>{" "}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No rooms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PaginationControls totalPages={totalPages} />
      </div>
    </div>
  )
}
