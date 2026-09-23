import type { ReactNode } from "react"

export type NavSubItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
}

/** Flat sidebar link — no nested children */
export type NavMenuItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
}

/** Expandable sidebar section — requires at least one child link */
export type CollapsibleNavItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
  items: NavSubItem[]
}
