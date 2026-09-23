"use client"

import Link from "next/link"
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  IndianRupee,
  MapPin,
  Phone,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { GroupedTuitionPlan } from "@/types/tuition-types"

import { formatRupee } from "../../lib/utils"

export default function OrgTuitionList({
  tuitionPlans,
}: {
  tuitionPlans: GroupedTuitionPlan[]
}) {
  const totalStudents = tuitionPlans.reduce(
    (sum, plan) => sum + plan.students.length,
    0
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tuition</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Active tuition plans with teachers and enrolled students.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/30 bg-primary/8 px-2.5 py-1 text-sm text-primary"
          >
            <BookOpen className="size-3.5" />
            {tuitionPlans.length} plan{tuitionPlans.length === 1 ? "" : "s"}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <Users className="size-3.5" />
            {totalStudents} enrolled
          </Badge>
        </div>
      </div>

      {tuitionPlans.length === 0 ? (
        <Card className="border-dashed border-warning/30 bg-warning/5">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <GraduationCap className="size-6" />
            </div>
            <p className="font-semibold">No active tuition enrollments</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Assigned students will appear here grouped by plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {tuitionPlans.map((plan) => {
            const previewStudents = plan.students.slice(0, 4)
            const extraCount = plan.students.length - previewStudents.length
            const hasStudents = plan.students.length > 0

            return (
              <Card
                key={plan.tuitionPlanId}
                className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="gap-2 border-b border-primary/10 bg-linear-to-r from-primary/8 via-background to-background px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 truncate text-base">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                          <GraduationCap className="size-3.5" />
                        </span>
                        <span className="truncate">{plan.tuitionPlanName}</span>
                      </CardTitle>
                      <CardDescription className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {plan.subjects ? (
                          <Badge className="h-5 border-sky-200 bg-sky-50 px-1.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
                            {plan.subjects}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className="h-5 gap-0.5 border-amber-200 bg-amber-50 px-1.5 text-[11px] font-medium text-amber-800 tabular-nums hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          {formatRupee(plan.monthlyFee)}/mo
                        </Badge>
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 tabular-nums",
                        hasStudents
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-muted-foreground/20 bg-muted text-muted-foreground"
                      )}
                    >
                      <Users className="mr-1 size-3" />
                      {plan.students.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-4 py-3">
                  <div className="flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50/80 px-2.5 py-2 dark:border-violet-900/60 dark:bg-violet-950/30">
                    <Avatar className="size-8 rounded-md ring-2 ring-violet-200 dark:ring-violet-800">
                      <AvatarFallback className="rounded-md bg-violet-600 text-xs font-semibold text-white">
                        {plan.teacherName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-violet-950 dark:text-violet-100">
                        {plan.teacherName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                        {plan.teacherPhone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <Phone className="size-3" />
                            {plan.teacherPhone}
                          </span>
                        ) : null}
                        {plan.teacherAddress ? (
                          <span className="inline-flex min-w-0 items-center gap-1 text-amber-800 dark:text-amber-300">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">
                              {plan.teacherAddress}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {plan.students.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                      No students enrolled yet.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-2.5 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                      <div className="flex items-center">
                        {previewStudents.map((student, index) => (
                          <Avatar
                            key={student.studentId}
                            className="size-8 border-2 border-emerald-100 dark:border-emerald-900"
                            style={{ marginLeft: index === 0 ? 0 : -10 }}
                          >
                            {student.studentProfileImage ? (
                              <AvatarImage
                                src={`/${student.studentProfileImage}`}
                                alt={student.studentName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-emerald-100 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              {student.studentName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {extraCount > 0 ? (
                          <span
                            className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums shadow-sm"
                            style={{ marginLeft: -10 }}
                          >
                            +{extraCount}
                          </span>
                        ) : null}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="xs"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            View all
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <GraduationCap className="size-4 text-primary" />
                              {plan.tuitionPlanName}
                            </DialogTitle>
                            <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {plan.students.length} enrolled
                              </Badge>
                              <Badge className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
                                {plan.teacherName}
                              </Badge>
                            </DialogDescription>
                          </DialogHeader>

                          <ul className="max-h-[min(60vh,24rem)] divide-y overflow-y-auto rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                            {plan.students.map((student) => (
                              <li
                                key={student.studentId}
                                className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <Avatar className="size-9 ring-2 ring-emerald-100 dark:ring-emerald-900">
                                    {student.studentProfileImage ? (
                                      <AvatarImage
                                        src={`/${student.studentProfileImage}`}
                                        alt={student.studentName}
                                      />
                                    ) : null}
                                    <AvatarFallback className="bg-emerald-100 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                      {student.studentName
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {student.studentName}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {student.studentPhone || "No phone"}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                  <Link
                                    href={`/org/dashboard/students/${student.studentId}`}
                                  >
                                    <ExternalLink />
                                  </Link>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
