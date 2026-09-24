"use client"

import { useMemo } from "react"
import { orgNavGroups } from "./constants/nav-data"
import { NavGroup } from "./nav-group"
import { SidebarMenuSkeleton } from "./sidebar-skeleton"
import { usePermissions } from "@/lib/permissions/usePermissions"

export function SidebarNav() {
  const { hasPermission, isLoading } = usePermissions()

  const visibleGroups = useMemo(
    () =>
      orgNavGroups.filter((group) =>
        hasPermission(group.resource, group.action)
      ),
    [hasPermission]
  )

  if (isLoading) return <SidebarMenuSkeleton />

  return (
    <div className="">
      {visibleGroups.map((group) => (
        <NavGroup key={group.label} label={group.label} items={group.items} />
      ))}
    </div>
  )
}

