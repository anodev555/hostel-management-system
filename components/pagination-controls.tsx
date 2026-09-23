"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pagination,PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { Select } from "./ui/select"
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"
import { cn } from "@/lib/utils"




const DEFAULT_PER_PAGE_OPTIONS = [5, 10, 15, 20] as const

type PaginationControlsProps = {
  totalPages: number
  /** URL param for current page. Default: `"page"` */
  pageParam?: string
  /** URL param for rows per page. Default: `"perpage"` */
  perPageParam?: string
  perPageOptions?: readonly number[]
  perPageLabel?: string
  className?: string
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | "ellipsis")[] {
  if (totalPages <= 0) return []
  if (totalPages === 1) return [1]

  const totalPageNumbers = siblingCount * 2 + 5

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from(
      { length: leftItemCount },
      (_, index) => index + 1
    )
    return [...leftRange, "ellipsis", totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, index) => totalPages - rightItemCount + index + 1
    )
    return [1, "ellipsis", ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, index) => leftSibling + index
  )

  return [1, "ellipsis", ...middleRange, "ellipsis", totalPages]
}

export function PaginationControls({
  totalPages,
  pageParam = "page",
  perPageParam = "perpage",
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  perPageLabel = "Rows per page",
  className,
}: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = Math.min(
    Math.max(1, Number(searchParams.get(pageParam)) || 1),
    Math.max(totalPages, 1)
  )

  const currentPerPage = String(
    Number(searchParams.get(perPageParam)) ||
      perPageOptions[0] ||
      DEFAULT_PER_PAGE_OPTIONS[0]
  )

  function buildHref(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) {
      params.delete(pageParam)
    } else {
      params.set(pageParam, String(nextPage))
    }
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  function navigate(nextPage: number) {
    router.replace(buildHref(nextPage), { scroll: false })
  }

  function handlePerPageChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(perPageParam, value)
    params.delete(pageParam)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const pageItems = getPaginationItems(currentPage, totalPages)
  const showPagination = totalPages > 1

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">{perPageLabel}</span>
        <Select value={currentPerPage} onValueChange={handlePerPageChange}>
          <SelectTrigger
            size="sm"
            className="min-w-16"
            aria-label={perPageLabel}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {perPageOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPagination ? (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildHref(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={cn(
                  currentPage <= 1 && "pointer-events-none opacity-50"
                )}
                onClick={(event) => {
                  if (currentPage <= 1) {
                    event.preventDefault()
                    return
                  }
                  event.preventDefault()
                  navigate(currentPage - 1)
                }}
              />
            </PaginationItem>

            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={buildHref(item)}
                    isActive={item === currentPage}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={buildHref(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={cn(
                  currentPage >= totalPages && "pointer-events-none opacity-50"
                )}
                onClick={(event) => {
                  if (currentPage >= totalPages) {
                    event.preventDefault()
                    return
                  }
                  event.preventDefault()
                  navigate(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
