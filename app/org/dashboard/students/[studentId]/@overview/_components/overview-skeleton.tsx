"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OverviewSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-20" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex flex-row items-center gap-2">
                <Skeleton className="size-13 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-row items-center gap-2 rounded-md border p-2"
              >
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
