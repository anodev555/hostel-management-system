"use client"

import {
  BedDouble,
  EyeIcon,
  GraduationCap,
  MapPin,
  School,
  User,
  Users,
  Utensils,
} from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { StudentOverviewItem } from "@/types/student-type"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function formatCurrency(value: string | null | undefined) {
  if (!value) return "—"
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (
    (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
  ).toUpperCase()
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:
      "bg-green-500/15 text-green-700 ring-green-500/30 dark:text-green-400",
    inactive:
      "bg-yellow-500/15 text-yellow-700 ring-yellow-500/30 dark:text-yellow-400",
    suspended: "bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-400",
    checkedOut: "bg-muted text-muted-foreground ring-border",
  }

  const label =
    status === "checkedOut"
      ? "Checked out"
      : status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Badge
      variant="outline"
      className={cn("capitalize ring-1", styles[status] ?? styles.inactive)}
    >
      {label}
    </Badge>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium wrap-break-word">{value ?? "—"}</p>
    </div>
  )
}

function CategorySection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  )
}

export default function StudentViewDialog({
  student,
}: {
  student: StudentOverviewItem
}) {
  const [open, setOpen] = useState(false)
  const { student: profile, room, food, tuition } = student

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <EyeIcon className="size-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <Avatar className="size-14 shrink-0 ring-2 ring-primary/15">
              <AvatarImage
                src={
                  profile.profileImage ? `/${profile.profileImage}` : undefined
                }
                alt={profile.fullName}
              />
              <AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-left text-lg">
                {profile.fullName}
              </DialogTitle>
              <DialogDescription className="text-left">
                {profile.collegeOrSchool} · {profile.course}
              </DialogDescription>
              <StatusBadge status={profile.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <CategorySection icon={User} title="Personal information">
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
              <DetailItem label="Full name" value={profile.fullName} />
              <DetailItem
                label="Gender"
                value={<span className="capitalize">{profile.gender}</span>}
              />
              <DetailItem
                label="Date of birth"
                value={formatDate(profile.dateOfBirth)}
              />
              <DetailItem label="Email" value={profile.email} />
              <DetailItem label="Student phone" value={profile.studentPhone} />
            </div>
          </CategorySection>

          <Separator />

          <CategorySection icon={School} title="Academic & admission">
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
              <DetailItem
                label="College / school"
                value={profile.collegeOrSchool}
              />
              <DetailItem label="Course" value={profile.course} />
              <DetailItem
                label="Admission number"
                value={profile.addmissionNumber}
              />
              <DetailItem
                label="Admission date"
                value={formatDate(profile.addmissionDate)}
              />
            </div>
          </CategorySection>

          <Separator />

          <CategorySection icon={MapPin} title="Address">
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
              <DetailItem label="Province" value={profile.province} />
              <DetailItem label="District" value={profile.district} />
              <DetailItem label="City" value={profile.city} />
              <DetailItem label="Municipality" value={profile.municipality} />
              <DetailItem label="Ward" value={profile.ward} />
              <DetailItem
                label="Full address"
                value={`Ward ${profile.ward}, ${profile.municipality}, ${profile.city}, ${profile.district}`}
                className="sm:col-span-2"
              />
            </div>
          </CategorySection>

          <Separator />

          <CategorySection icon={Users} title="Parent & guardian">
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
              <DetailItem label="Father's name" value={profile.fatherName} />
              <DetailItem label="Mother's name" value={profile.motherName} />
              <DetailItem
                label="Guardian phone 1"
                value={profile.guardianPhone1}
              />
              <DetailItem
                label="Guardian phone 2"
                value={profile.guardianPhone2}
              />
            </div>
          </CategorySection>

          <Separator />

          <CategorySection icon={BedDouble} title="Room & lodging">
            {room ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                <DetailItem
                  label="Room number"
                  value={room.roomNumber ?? "—"}
                />
                <DetailItem label="Floor" value={room.floor ?? "—"} />
                <DetailItem label="Bed number" value={room.bedNumber} />
                <DetailItem label="Lodging plan" value={room.lodgingPlanName} />
                <DetailItem
                  label="Monthly fee"
                  value={`${formatCurrency(room.monthlyFee)}/mo`}
                />
                <DetailItem
                  label="Assigned from"
                  value={formatDate(room.startDate)}
                />
                {room.endDate ? (
                  <DetailItem
                    label="End date"
                    value={formatDate(room.endDate)}
                  />
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No active room assignment.
              </p>
            )}
          </CategorySection>

          <Separator />

          <CategorySection icon={Utensils} title="Food plan">
            {food ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                <DetailItem label="Plan name" value={food.planName} />
                <DetailItem
                  label="Monthly fee"
                  value={`${formatCurrency(food.monthlyFee)}/mo`}
                />
                <DetailItem
                  label="Start date"
                  value={formatDate(food.startDate)}
                />
                {food.endDate ? (
                  <DetailItem
                    label="End date"
                    value={formatDate(food.endDate)}
                  />
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No active food plan.
              </p>
            )}
          </CategorySection>

          <Separator />

          <CategorySection icon={GraduationCap} title="Tuition">
            {tuition ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                <DetailItem label="Plan name" value={tuition.planName} />
                <DetailItem
                  label="Teacher"
                  value={tuition.teacherName ?? "—"}
                />
                <DetailItem
                  label="Monthly fee"
                  value={`${formatCurrency(tuition.monthlyFee)}/mo`}
                />
                <DetailItem
                  label="Start date"
                  value={formatDate(tuition.startDate)}
                />
                {tuition.endDate ? (
                  <DetailItem
                    label="End date"
                    value={formatDate(tuition.endDate)}
                  />
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No active tuition plan.
              </p>
            )}
          </CategorySection>
        </div>
      </DialogContent>
    </Dialog>
  )
}
