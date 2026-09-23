"use client"

import {
  Bed,
  Building2,
  GraduationCap,
  SettingsIcon,
  UserRound,
  Utensils,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type SettingsNavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  /** Match exact path only (used for settings root / profile) */
  exact?: boolean
}

type SettingsNavGroup = {
  label: string
  items: SettingsNavItem[]
}

const settingsNavGroups: SettingsNavGroup[] = [
  {
    label: "Organization",
    items: [
      {
        title: "Profile",
        href: "/org/dashboard/setting",
        icon: Building2,

        exact: true,
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        title: "Lodging",
        href: "/org/dashboard/setting/lodging",
        icon: Building2,
      },
      {
        title: "Rooms",
        href: "/org/dashboard/setting/room",
        icon: Bed,
      },
      {
        title: "Fooding",
        href: "/org/dashboard/setting/fooding",
        icon: Utensils,
      },
      {
        title: "Tuition",
        href: "/org/dashboard/setting/tuitionplan",
        icon: GraduationCap,
      },
      {
        title: "Teachers",
        href: "/org/dashboard/setting/teacher",
        icon: UserRound,
      },
    ],
  },
]

function isActive(pathname: string, item: SettingsNavItem) {
  if (item.exact) {
    return pathname === item.href
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-44 shrink-0 sm:w-52 lg:w-56 xl:w-60">
      <div className="sticky top-4 flex h-full flex-col space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SettingsIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              Settings
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Organization setup
            </p>
          </div>
        </div>

        <nav className="space-y-3">
          {settingsNavGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="truncate px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-3">
                {group.label}
              </p>
              <ul className="space-y-2">
                {group.items.map((item) => {
                  const active = isActive(pathname, item)
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors sm:gap-3 sm:px-3 sm:py-2.5",
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className="flex flex-col gap-0.5">
                          <span>{item.title}</span>
                          {item.description ? (
                            <span
                              className={cn(
                                "text-xs leading-snug font-normal",
                                active
                                  ? "text-primary/80"
                                  : "text-muted-foreground"
                              )}
                            >
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
