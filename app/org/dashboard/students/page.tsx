import React, { Suspense } from "react"
import Student from "./components/student"
import { Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingBar from "@/components/loading-bar"
import StudentSkeleton from "./components/student-skeleton"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    perPage?: string
    search?: string
    status?: string
  }>
}) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <Suspense fallback={<StudentSkeleton />}>
        <Student searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
