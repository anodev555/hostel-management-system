"use client"

import { getActiveTuitionPlansAction } from "@/app/org/dashboard/lib/shared/get-tuitionplan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StudentOverviewItem } from "@/types/student-type"
import { ActiveTuitionPlanOption } from "@/types/tuition-types"
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  IndianRupee,
  Loader2Icon,
  LogOutIcon,
  UserRound,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { releaseTuitionAction } from "../../action/tuition/student-tuition"
import AssignTuitionForm from "./assigntuition-form"
import StudentTuitionHistory from "./student-tuitionhistory"
import LoadingBar from "@/components/loading-bar"
import TuitionFormSkeleton from "./tuition-skeleton"

type StudentTuitionProps = {
  studentId: string
  tuition: StudentOverviewItem["tuition"]
}
export default function StudentTuition({
  studentId,
  tuition,
}: StudentTuitionProps) {
  const isAssignedTuition = tuition !== null
  const [tuitionsOptions, setTuitionsOptions] = useState<
    ActiveTuitionPlanOption[]
  >([])
  const [tuitionsLoading, setTuitionsLoading] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const bumpHistory = () => setHistoryRefreshKey((k) => k + 1)

  useEffect(() => {
    if (isAssignedTuition) {
      setTuitionsOptions([])
      setTuitionsLoading(false)
      return
    }
    setTuitionsLoading(true)
    let cancelled = false

    async function getTuitions() {
      try {
        const response = await getActiveTuitionPlansAction()
        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setTuitionsOptions(response.data ?? [])
      } catch (error) {
        if (cancelled) return
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong!"}`
        )
      } finally {
        setTuitionsLoading(false)
      }
    }

    getTuitions()

    return () => {
      cancelled = true
    }
  }, [isAssignedTuition])

  return (
    <div>
      {isAssignedTuition ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">
                Current tuition assignment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This student is enrolled in a tuition plan. Remove it before
                assigning a new one.
              </p>
            </div>
            <ReleaseTuitionDialog
              studentId={studentId}
              onRelease={bumpHistory}
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <GraduationCap className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Plan
                  </p>
                  <p className="text-sm font-semibold">{tuition.planName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Teacher
                  </p>
                  <p className="text-sm font-semibold">
                    {tuition.teacherName ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Subjects
                  </p>
                  <p className="text-sm font-semibold">
                    {tuition.teacherSubject ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <IndianRupee className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Monthly fee
                  </p>
                  <p className="text-sm font-semibold">
                    Rs.{tuition.monthlyFee}/mo
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <span>Started {tuition.startDate}</span>
            </div>
          </CardContent>
        </Card>
      ) : tuitionsLoading ? (
        <TuitionFormSkeleton />
      ) : tuitionsOptions.length > 0 ? (
        <AssignTuitionForm
          studentId={studentId}
          tuitionPlans={tuitionsOptions}
          onAssign={bumpHistory}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              No tuition plans available
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create an active tuition plan in Settings before assigning one.
            </p>
          </CardHeader>
        </Card>
      )}
      <StudentTuitionHistory
        studentId={studentId}
        refreshKey={historyRefreshKey}
      />
    </div>
  )
}

function ReleaseTuitionDialog({
  studentId,
  onRelease,
}: {
  studentId: string
  onRelease: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleRelease() {
    if (isPending) return
    startTransition(async () => {
      try {
        const response = await releaseTuitionAction({ studentId })
        if (!response.success) {
          toast.error(response.message)
          return
        }
        toast.success(response.message)
        setIsOpen(false)
        router.refresh()
        onRelease?.()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong!"
        )
      }
    })
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <LogOutIcon className="size-4" />
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release this student from tuition?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleRelease}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Release"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
