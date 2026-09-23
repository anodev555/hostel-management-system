import { Suspense } from "react"
import { Shield } from "lucide-react"

import GetAllRoles from "./_components/roles"
import RoleListSkeleton from "./_components/rolelist-skeleton"
import RoleForm from "./_components/role-form"
import { Card, CardContent } from "@/components/ui/card"
import Roles from "./_components/roles"
import RolesHeader from "./_components/roles-header"

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Suspense key={searchParams.toString()} fallback={<RoleListSkeleton />}>
        <Roles searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
