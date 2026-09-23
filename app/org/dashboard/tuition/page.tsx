import React, { Suspense } from "react"
import OrgTuition from "./_components/org-tuition"
import OrgTuitionSkeleton from "./_components/orgtuition-skeleton"

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<OrgTuitionSkeleton />}>
        <OrgTuition />
      </Suspense>
    </div>
  )
}
