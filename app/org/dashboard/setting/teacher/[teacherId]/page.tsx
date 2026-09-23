import { Suspense } from "react"
import EditTeacher from "./_components/edit-teacher"

export default function page({
  params,
}: {
  params: Promise<{ teacherId: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading teacher...</div>
      }
    >
      <EditTeacher params={params} />
    </Suspense>
  )
}
