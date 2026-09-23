"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function OrgHeader() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <CardTitle>Organization profile</CardTitle>
            <CardDescription>
              Update your hostel name, logo, location, and other organization
              details. This section opens by default when you visit Settings.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
