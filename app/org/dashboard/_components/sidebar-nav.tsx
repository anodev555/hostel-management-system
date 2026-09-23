"use client"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { data } from "./constants/nav-data"
import { NavMenu } from "./nav-menu"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { PermissionGate } from "@/lib/permissions/permission-gate"

export function SidebarNav() {
  return (
    <>
      {/* <NavMenu label="New Admission" items={data.NewAdmission} /> */}
      {/* <SidebarGroup className="my-2">
        <SidebarMenu className="">
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10" asChild isActive={true}>
              
             
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup> */}
<PermissionGate resource="student" action="create">
                 <Link href="/org/dashboard/new-admission" className="flex flex-row items-center gap-2">
                <UserPlus className="h-4 w-4" />
                New Admission
              </Link>
              </PermissionGate>

      <PermissionGate resource="student" action="read">
        <NavMenu label="Students" items={data.Students} />
      </PermissionGate>

      <PermissionGate resource="billing" action="read">
        <NavMenu label="Billing" items={data.Billing} />
      </PermissionGate>
      
      <PermissionGate resource="tuition" action="read">
        <NavMenu label="Tuition" items={data.Tuition} />
      </PermissionGate>

      <PermissionGate resource="rooms" action="read">
        <NavMenu label="Room" items={data.Rooms} />
      </PermissionGate>
      
      <PermissionGate resource="expenses" action="read">
        <NavMenu label="Expenses" items={data.Expenses} />
      </PermissionGate>
      
      <PermissionGate resource="ac" action="read">
        <NavMenu label="Roles" items={data.roles} />
      </PermissionGate>
      
      <PermissionGate resource="staff" action="read">
        <NavMenu label="Staff" items={data.staff} />
      </PermissionGate>
    </>
  )
}


