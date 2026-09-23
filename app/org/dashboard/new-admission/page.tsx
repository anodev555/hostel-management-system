import { Suspense } from "react"
import NewAdmission from "./_components/newadmission"

export default function page() {
  return (
    <div className="flex w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <NewAdmission />
      </Suspense>
    </div>
  )
}
