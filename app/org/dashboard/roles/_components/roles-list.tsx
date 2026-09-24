"use client"

import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoleItem } from "@/types/role/roles-type"
import { PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import RolesHeader from "./roles-header"
import { formatDateYearMonth } from "../../lib/utils"
import { usePermissions } from "@/lib/permissions/usePermissions"

export default function RolesList({ roles }: { roles: RoleItem[] }) {
  const router = useRouter()
  const {hasPermission}= usePermissions()
  return (
    <>
      <RolesHeader />
      <SearchBar
        param="search"
        placeholder="Search roles by name..."
        className="max-w-md"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Create At</TableHead>
           
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length > 0 ? (
            roles.map((role) => {
              const permissions = JSON.parse(role.permission) as Record<
                string,
                string[]
              >
              const totalPermissions = Object.entries(permissions).filter(
                ([_, value]) => value.length > 0
              ).length
              return (
                <TableRow key={role.id}
                onClick={() => {
                  if(hasPermission("ac","update"))
                        router.push(`/org/dashboard/roles/${role.id}`)
                      }}
                >
                  <TableCell>
                    <span className="text-sm font-medium">{role.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-muted-foreground">
                      {totalPermissions} permissions
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-muted-foreground">
                      {role.createdByUsername ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateYearMonth(role.createdAt)}</TableCell>
                 
                </TableRow>
              )
            })
          ) : (
            <>
              <TableRow>
                <TableCell colSpan={4} className="h-10 text-center">
                  0 roles found
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </>
  )
}
