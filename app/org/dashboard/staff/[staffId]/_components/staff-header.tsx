"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StaffDetail } from "@/types/staff-type"

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
}

export default function StaffHeader({ staff }: { staff: StaffDetail }) {
  const router = useRouter()
  const username = staff.displayUsername ?? staff.username

  return (
    <Card className="mx-auto w-full max-w-7xl">
      <CardHeader className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="px-2"
              onClick={() => router.push("/org/dashboard/staff")}
            >
              <ArrowLeft className="size-4" />
              Staff
            </Button>

            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={staff.image ?? ""} alt={staff.name ?? ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-2xl capitalize">
                  {staff.name ?? "Unnamed staff"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {username ? `@${username}` : "No username"}
                  {" · "}
                  <span className="capitalize">{staff.role}</span>
                </CardDescription>
                <p className="mt-1 text-sm text-muted-foreground">
                  Joined {formatDate(staff.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Username
            </p>
            <p className="mt-1 text-sm font-medium">{username ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Role
            </p>
            <p className="mt-1 text-sm font-medium capitalize">{staff.role}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Created at
            </p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(staff.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Email
            </p>
            <p className="mt-1 text-sm font-medium">{staff.email ?? "—"}</p>
          </div>
        </div> */}
      </CardHeader>
    </Card>
  )
}
