"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ArrowRightLeft, ChevronsUpDownIcon } from "lucide-react"
import { authClient } from "@/lib/authClient"
import type { Org } from "@/types/org-type"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function TeamSwitcher({
  currentActiveOrganization,
  organizations,
}: {
  currentActiveOrganization: Org | null
  organizations: Org[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const TOAST_ID = "switching-org"
  const [isSwitchingOrg, setIsSwitchingOrg] = useState(false)

  const handleSwitchOrganization = async (
    organizationId: string,
    organizationSlug: string
  ) => {
    if (organizationId === currentActiveOrganization?.id) {
      return
    }
    try {
      setIsSwitchingOrg(true)
      toast.loading("Switching organization...", {
        id: TOAST_ID,
      })
      const { data, error } = await authClient.organization.setActive({
        organizationId,
        organizationSlug,
      })

      if (error) {
        toast.error(error.message, {
          id: TOAST_ID,
        })
        return
      }
      toast.success(`Switched to ${data.name}`, {
        id: TOAST_ID,
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to switch organization", {
        id: TOAST_ID,
      })
      return
    } finally {
      setIsSwitchingOrg(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {organizations.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="">
                  {currentActiveOrganization?.logo && (
                    <img
                      src={`/${currentActiveOrganization.logo}`}
                      alt={currentActiveOrganization.name}
                      className="aspect-square size-10 rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentActiveOrganization?.name}
                  </span>
                  <span className="truncate text-xs font-semibold">
                    {currentActiveOrganization?.location}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="flex w-48 flex-col items-center justify-center gap-2"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-md inline-flex items-center gap-2 text-muted-foreground">
                Switch Hostel
                <ArrowRightLeft size="20" />
              </DropdownMenuLabel>
              {organizations.map((org, index) => {
                const isActive = org.id === currentActiveOrganization?.id
                return (
                  <DropdownMenuItem
                    key={org.id}
                    disabled={isSwitchingOrg}
                    onClick={() => {
                      handleSwitchOrganization(org.id, org.slug)
                    }}
                    className={cn("w-full gap-2 p-2", isActive && "")}
                  >
                    {/* <div className="flex size-6 items-center justify-center rounded-md border">
                      {org.logo}
                    </div> */}
                    {isActive && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                    )}
                    {org.name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            {currentActiveOrganization?.logo && (
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {currentActiveOrganization?.logo}
              </div>
            )}

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xl font-bold">
                {currentActiveOrganization?.name &&
                  currentActiveOrganization?.name?.charAt(0).toUpperCase() +
                    currentActiveOrganization?.name?.slice(1)}
              </span>
              <span className="truncate text-xs">
                {currentActiveOrganization?.location &&
                  currentActiveOrganization?.location?.charAt(0).toUpperCase() +
                    currentActiveOrganization?.location?.slice(1)}
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
