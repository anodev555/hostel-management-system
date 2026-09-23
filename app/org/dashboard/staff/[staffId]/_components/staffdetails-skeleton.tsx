"use client"

import { CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"

export default function StaffDetailsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <Skeleton className="h-40 w-full" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </TabsList>

        <TabsContent value="profile">
          <div className="flex h-70 w-full flex-col gap-2 rounded-md bg-muted p-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
