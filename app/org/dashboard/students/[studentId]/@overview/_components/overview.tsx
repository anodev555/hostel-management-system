"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentOverviewItem } from "@/types/student-type"
import {
  ArrowLeftIcon,
  BedDouble,
  EyeIcon,
  FileIcon,
  GraduationCap,
  Hash,
  LogOutIcon,
  MapPin,
  PencilIcon,
  Users,
  Utensils,
  WalletIcon,
} from "lucide-react"
import StudentViewDialog from "./student-viewdialog"
import StudentEditDialog from "./student-edit"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PermissionGate } from "@/lib/permissions/permission-gate"

// helper (top of file)
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function MiniCard({
  icon: Icon,
  label,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  title: string
  sub?: string | null
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-xs leading-tight font-semibold">{title}</p>
        {sub ? (
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default function Overview({
  student,
}: {
  student: StudentOverviewItem
}) {
  const router = useRouter()
  return (
    <div>
      <Button
        onClick={() => router.push("/org/dashboard/students")}
        variant="outline"
        className="mb-2"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Button>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div>
                <Avatar className="size-20">
                  <AvatarImage src={`/${student.student.profileImage}`} />
                  <AvatarFallback>
                    {student.student.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {student.student.fullName}
                </h1>
                <p className="text-sm text-gray-500">
                  {student.student.collegeOrSchool} | {student.student.course}
                </p>
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <PermissionGate resource="student" action="read">
              <StudentViewDialog student={student} />
            </PermissionGate>
            <PermissionGate resource="student" action="update">
              <StudentEditDialog student={student} />
            </PermissionGate>
            <PermissionGate resource="payment" action="read">
            <Link
              href={`/org/dashboard/payments?studentId=${student.student.id}`}
            >
              <Button variant="default">
                <WalletIcon className="size-4" />
                Payments
              </Button>
            </Link>
            </PermissionGate>

            <PermissionGate resource="student" action="checkout">
              <Button variant="destructive">
                <LogOutIcon className="size-4" />
                CheckOut
              </Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <MiniCard
              icon={BedDouble}
              label="Room"
              title={
                student.room
                  ? `Rm ${student.room.roomNumber ?? "—"} · Bed ${student.room.bedNumber}`
                  : "Not assigned"
              }
              sub={
                student.room
                  ? `${student.room.lodgingPlanName} · Rs.${student.room.monthlyFee}/mo`
                  : null
              }
            />
            <MiniCard
              icon={Users}
              label="Father"
              title={student.student.fatherName}
              sub={student.student.guardianPhone1}
            />
            <MiniCard
              icon={Users}
              label="Mother"
              title={student.student.motherName}
              sub={student.student.guardianPhone2 ?? "—"}
            />
            {student.food ? (
              <MiniCard
                icon={Utensils}
                label="Food"
                title={student.food.planName}
                sub={`Rs.${student.food.monthlyFee}/mo`}
              />
            ) : null}
            {student.tuition ? (
              <MiniCard
                icon={GraduationCap}
                label="Tuition"
                title={student.tuition.planName}
                sub={`Rs.${student.tuition.monthlyFee}/mo`}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
