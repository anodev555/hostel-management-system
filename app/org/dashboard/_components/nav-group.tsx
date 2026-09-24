"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavGroupItem } from "./nav-types";

interface NavGroupProps {
  label: string;
  items: NavGroupItem[];
}

function isRouteActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavGroup({ label, items }: NavGroupProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="scrollbar-none">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const isItemActive =
            isRouteActive(pathname, item.url) ||
            (hasChildren &&
              item.items?.some((sub) => isRouteActive(pathname, sub.url)));

          if (hasChildren) {
            return (
              <Collapsible
                key={`${item.title}-${item.url}`}
                asChild
                defaultOpen={isItemActive || item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isItemActive}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem
                          key={`${item.title}-${subItem.title}-${subItem.url}`}
                        >
                          <SidebarMenuSubButton
                            asChild
                            isActive={isRouteActive(pathname, subItem.url)}
                          >
                            <Link href={subItem.url}>
                              {subItem.icon}
                              <span className="font-semibold">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Simple link without dropdown
          return (
            <SidebarMenuItem key={`${item.title}-${item.url}`}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span className="font-semibold">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}