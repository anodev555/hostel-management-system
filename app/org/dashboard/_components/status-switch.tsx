"use client"

import { Switch } from "@/components/ui/switch"

export default function StatusSwitch({
  checked,
  pending,
  activeLabel = "Mark inactive",
  inactiveLabel = "Mark active",
  onToggle,
}: {
  checked: boolean
  pending: boolean
  activeLabel?: string
  inactiveLabel?: string
  onToggle: (checked: boolean) => void
}) {
  return (
    <span
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Switch
        size="sm"
        checked={checked}
        disabled={pending}
        onCheckedChange={onToggle}
        aria-label={checked ? activeLabel : inactiveLabel}
        title={checked ? activeLabel : inactiveLabel}
      />
    </span>
  )
}
