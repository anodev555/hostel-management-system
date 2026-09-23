"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavMenuItem } from "@/app/org/dashboard/_components/nav-types"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

type NavMenuProps = {
  label?: string
  items: NavMenuItem[]
  /** Hide this group when the sidebar is collapsed to icon mode */
  hideWhenCollapsed?: boolean
}

export function NavMenu({
  label,
  items,
  hideWhenCollapsed = false,
}: NavMenuProps) {
  const pathname = usePathname()
  return (
    <SidebarGroup
      className={cn(
        hideWhenCollapsed && "group-data-[collapsible=icon]:hidden"
      )}
    >
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={
                (item.isActive && pathname === item.url) ||
                pathname.startsWith(`${item.url}/`)
              }
            >
              <a href={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
