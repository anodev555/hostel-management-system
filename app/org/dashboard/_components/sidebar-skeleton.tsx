import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamSwitcherSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          disabled
          className="pointer-events-none opacity-100"
        >
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="grid min-w-0 flex-1 gap-1 text-left">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="ml-auto size-4 shrink-0 rounded-sm" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          disabled
          className="pointer-events-none opacity-100"
        >
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="grid min-w-0 flex-1 gap-1 text-left">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="ml-auto size-4 shrink-0 rounded-sm" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function SidebarMenuSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-col gap-6 p-2">
        {Array.from({ length: 15 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
