import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import React, { Suspense } from "react"
import { Separator } from "@/components/ui/separator"
import { AppSidebarShell } from "./_components/app-sidebar-shell"
import { OrgSidebarHeader } from "./_components/org-sidebar-header"
import { OrgSidebarFooter } from "./_components/org-sidebar-footer"

import { SidebarNav } from "./_components/sidebar-nav"
import {
  NavUserSkeleton,
  SidebarMenuSkeleton,
  TeamSwitcherSkeleton,
} from "./_components/sidebar-skeleton"
import { PermissionProvider } from "@/lib/permissions/permissions-context"

export default async function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionProvider>
      <SidebarProvider className="bg-[#6342bc]">
        <AppSidebarShell
          header={
            <Suspense fallback={<TeamSwitcherSkeleton />}>
              <OrgSidebarHeader />
            </Suspense>
          }
          nav={
            <Suspense fallback={<SidebarMenuSkeleton />}>
              <SidebarNav />
            </Suspense>
          }
          footer={
            <Suspense fallback={<NavUserSkeleton />}>
              <OrgSidebarFooter />
            </Suspense>
          }
        />

        <SidebarInset className="rounded-l-4xl  shadow-2xl">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </PermissionProvider>
  )
}
