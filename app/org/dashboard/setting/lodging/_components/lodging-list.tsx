"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import StatusSwitch from "@/app/org/dashboard/_components/status-switch"
import { usePermissions } from "@/lib/permissions/usePermissions"
import { updateLodgingStatusAction } from "../action/lodging"

function LodgingStatusCell({ item }: { item: LodgingItem }) {
  const { hasPermission } = usePermissions()
  const [isPending, setIsPending] = useState(false)
  const [isActive, setIsActive] = useState(item.status === "active")

  async function handleToggle(checked: boolean) {
    if (isPending) return
    const nextStatus = checked ? "active" : "inactive"
    const previous = isActive
    setIsActive(checked)
    setIsPending(true)
    try {
      const response = await updateLodgingStatusAction({
        lodgingId: item.id,
        status: nextStatus,
      })
      if (response.success) {
        toast.success(response.message ?? `Lodging plan marked as ${nextStatus}`)
      } else {
        setIsActive(previous)
        toast.error(response.message ?? "Failed to update lodging status")
      }
    } catch (error) {
      setIsActive(previous)
      toast.error(
        error instanceof Error ? error.message : "Failed to update lodging status"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <Badge variant="default" className="bg-green-500 text-white">
          Active
        </Badge>
      ) : (
        <Badge variant="destructive" className="bg-red-500 text-white">
          Inactive
        </Badge>
      )}
      {hasPermission("lodging", "update") && (
        <StatusSwitch
          checked={isActive}
          pending={isPending}
          activeLabel="Mark lodging plan inactive"
          inactiveLabel="Mark lodging plan active"
          onToggle={handleToggle}
        />
      )}
    </div>
  )
}

export default function LodgingList({ data }: { data: LodgingItem[] }) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    if (hasPermission("lodging", "update")) {
                      router.push(`/org/dashboard/setting/lodging/${item.id}`)
                    }
                  }}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.monthlyPrice}</TableCell>
                  <TableCell>
                    <LodgingStatusCell item={item} />
                  </TableCell>
                  <TableCell>{item.createdByName}</TableCell>
                  <TableCell>
                    {item.createdAt.toLocaleDateString("en-US")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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
