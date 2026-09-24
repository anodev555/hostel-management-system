import type { ReactNode } from "react"

export type NavItem = {
  title: string
  url: string
  icon?: ReactNode
}

export type NavSubItem = NavItem

export type NavGroupItem = NavItem & {
  isActive?: boolean
  items?: NavSubItem[]
}

export type OrgNavGroup = {
  label: string
  resource: string
  action: string
  items: NavGroupItem[]
}