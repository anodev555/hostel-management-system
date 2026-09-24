"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"


export function AppSidebarShell({
  header,
  footer,
  nav,
}: {
  header: React.ReactNode
  footer: React.ReactNode
  nav: React.ReactNode
}) {
  return (
    <Sidebar collapsible="icon"className="rounded-r-lg border-0!">
      <SidebarHeader>{header}</SidebarHeader>

      <SidebarContent>{nav}</SidebarContent>

      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
