import React from "react"
import { getRoleDetailAction } from "../action/role-detail"
import RoleDetail from "./role-detail"
export default async function RoleContent({ roleId }: { roleId: string }) {
  const response = await getRoleDetailAction({
    roleId: roleId,
  })

  if (!response.success) {
    return (
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 rounded-md bg-red-500 p-4 text-white">
        <p>{response.message}</p>
      </div>
    )
  }

  const roleDetail = response.data

  return <RoleDetail role={roleDetail} />
}
