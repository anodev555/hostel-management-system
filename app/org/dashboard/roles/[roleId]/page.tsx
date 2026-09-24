import { Suspense } from "react"
import RoleDetailSkeleton from "./_components/roledetail-skeleton"
import Role from "./_components/role"


export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  return (
    <Suspense fallback={<RoleDetailSkeleton />}>
      <RoleDetailContent params={params} />
    </Suspense>
  )
}

async function RoleDetailContent({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = await params

  return <Role roleId={roleId} />
}
