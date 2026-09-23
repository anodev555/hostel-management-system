"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { NavMenuItem } from "./nav-types"

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
              isActive={item.isActive}
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
