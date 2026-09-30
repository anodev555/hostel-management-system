"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  DEFAULT_RANGE_MONTHS,
  MAX_RANGE_MONTHS,
  defaultRange,
} from "../schema/report-schema"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/** Rolling window of selectable years, centred on today. */
function yearOptions() {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current - 5; y <= current + 1; y++) years.push(y)
  return years
}

/**
 * Shared month-range filter for every report tab. State lives in the URL so
 * the range survives reload, tab switches, and link sharing, matching the
 * `student-filter.tsx` convention.
 */
export default function ReportFilter({
  fromYear,
  fromMonth,
  toYear,
  toMonth,
}: {
  fromYear: number
  fromMonth: number
  toMonth: number
  toYear: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function apply(nextFrom: { year: number; month: number }, nextTo: { year: number; month: number }) {
    // Ignore an inverted range rather than rendering an error; the actions
    // would reject it anyway.
    if (
      nextTo.year < nextFrom.year ||
      (nextTo.year === nextFrom.year && nextTo.month < nextFrom.month)
    ) {
      return
    }
    const span =
      (nextTo.year - nextFrom.year) * 12 + (nextTo.month - nextFrom.month)
    if (span > MAX_RANGE_MONTHS) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("fromYear", String(nextFrom.year))
    params.set("fromMonth", String(nextFrom.month))
    params.set("toYear", String(nextTo.year))
    params.set("toMonth", String(nextTo.month))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleFromYear(value: string) {
    apply({ year: Number(value), month: fromMonth }, { year: toYear, month: toMonth })
  }
  function handleFromMonth(value: string) {
    apply({ year: fromYear, month: Number(value) }, { year: toYear, month: toMonth })
  }
  function handleToYear(value: string) {
    apply({ year: fromYear, month: fromMonth }, { year: Number(value), month: toMonth })
  }
  function handleToMonth(value: string) {
    apply({ year: fromYear, month: fromMonth }, { year: toYear, month: Number(value) })
  }

  function reset() {
    const fallback = defaultRange()
    const params = new URLSearchParams()
    params.set("fromYear", String(fallback.from.year))
    params.set("fromMonth", String(fallback.from.month))
    params.set("toYear", String(fallback.to.year))
    params.set("toMonth", String(fallback.to.month))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">From</span>
        <Select value={String(fromMonth)} onValueChange={handleFromMonth}>
          <SelectTrigger className="w-40 rounded-xl" aria-label="From month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-2">
            {MONTHS.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(fromYear)} onValueChange={handleFromYear}>
          <SelectTrigger className="w-28 rounded-xl" aria-label="From year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-2">
            {yearOptions().map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">To</span>
        <Select value={String(toMonth)} onValueChange={handleToMonth}>
          <SelectTrigger className="w-40 rounded-xl" aria-label="To month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-2">
            {MONTHS.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(toYear)} onValueChange={handleToYear}>
          <SelectTrigger className="w-28 rounded-xl" aria-label="To year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-2">
            {yearOptions().map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="rounded-xl" onClick={reset}>
        Reset to last {DEFAULT_RANGE_MONTHS} months
      </Button>
    </div>
  )
}
