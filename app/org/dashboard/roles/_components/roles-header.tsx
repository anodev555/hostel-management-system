"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Shield } from "lucide-react"
import RoleForm from "./role-form"

export default function RolesHeader() {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-5" />
            Manage Roles
          </div>
          <div>
            <RoleForm />
          </div>
        </CardTitle>
        <CardDescription>
          Create and manage permission roles for staff
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
