"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

type SearchBarProps = {
  /** URL search param key, e.g. `"search"` or `"q"`. */
  param: string
  placeholder?: string
  /** Debounce delay in ms before updating the URL. Default: 300 */
  debounceMs?: number
  className?: string
}

export function SearchBar({
  param,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const paramValue = searchParams.get(param) ?? ""
  const [value, setValue] = useState(paramValue)
  const debouncedValue = useDebouncedValue(value, debounceMs)
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    setValue(paramValue)
  }, [paramValue])

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const current = params.get(param) ?? ""

    if (debouncedValue === current) return

    if (debouncedValue) {
      params.set("page", "1")
      params.set(param, debouncedValue)
    } else {
      params.delete(param)
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [debouncedValue, param, pathname, router, searchParamsString])

  function handleClear() {
    setValue("")
  }

  return (
    <InputGroup className={cn("rounded-xl", className)}>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        aria-label={placeholder}
      />
      {/* {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            aria-label="Clear search"
            onClick={handleClear}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null} */}
    </InputGroup>
  )
}
