"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrgTuitionSkeleton() {
  const cards = Array.from({ length: 8 })

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((_, index) => (
          <Card
            key={index}
            className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm"
          >
            <CardHeader className="gap-2 border-b border-primary/10 bg-muted/20 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-7 shrink-0 rounded-lg" />
                    <Skeleton className="h-5 w-3/4 max-w-40" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-6 w-10 shrink-0 rounded-full" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-2">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3 max-w-32" />
                  <Skeleton className="h-3 w-full max-w-36" />
                  <Skeleton className="h-3 w-4/5 max-w-28" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-2.5 py-2">
                <div className="flex items-center">
                  {Array.from({ length: 4 }).map((__, avatarIndex) => (
                    <Skeleton
                      key={avatarIndex}
                      className="size-8 shrink-0 rounded-full border-2 border-background"
                      style={{ marginLeft: avatarIndex === 0 ? 0 : -10 }}
                    />
                  ))}
                </div>
                <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
