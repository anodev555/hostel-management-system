"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { CollapsibleNav } from "./collapsible-nav";
import { data } from "./constants/nav-data";
import { NavUser } from "./nav-user";

function useActiveNav(pathname: string) {
  const hostelsActive = pathname.startsWith("/admin/dashboard/hostels");
  const subscriptionsActive = pathname.startsWith("/admin/dashboard/subscriptions");

  return {
    Hostels: data.Hostels.map((item) => ({
      ...item,
      isActive: hostelsActive,
      items: item.items.map((sub) => ({
        ...sub,
        isActive: hostelsActive,
      })),
    })),
    Subscriptions: data.Subscriptions.map((item) => ({
      ...item,
      isActive: subscriptionsActive,
      items: item.items.map((sub) => ({
        ...sub,
        isActive: subscriptionsActive,
      })),
    })),
  };
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
}) {
  const pathname = usePathname();
  const activeNav = useActiveNav(pathname);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <CollapsibleNav label="Hostels" items={activeNav.Hostels} />
        <CollapsibleNav label="Subscriptions" items={activeNav.Subscriptions} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}