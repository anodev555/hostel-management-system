"use client"

import { getActiveFoodPlansAction } from "@/app/org/dashboard/lib/shared/get-foodingplan"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentOverviewItem } from "@/types/student-type"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { ActiveFoodPlanOption } from "@/types/food-types"
import LoadingBar from "@/components/loading-bar"
import {
  CalendarDays,
  IndianRupee,
  Loader2Icon,
  Utensils,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { releaseFoodPlanAction } from "../../action/food/release-foodplan"
import AssignFoodPlanForm from "./asssignfoodplan-form"
import StudentFoodHistory from "./student-foodhistory"
import FoodFormSkeleton from "./food-skeleton"
type StudentFoodFormProps = {
  studentId: string
  food: StudentOverviewItem["food"]
}
export default function StudentFoodForm({
  studentId,
  food,
}: StudentFoodFormProps) {
  const isAssignedFood = food !== null
  const [foodPlans, setFoodPlans] = useState<ActiveFoodPlanOption[]>([])
  const [foodPlansLoading, setFoodPlansLoading] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const bumpHistory = () => setHistoryRefreshKey((k) => k + 1)
  useEffect(() => {
    if (isAssignedFood) {
      setFoodPlans([])
      return
    }
    setFoodPlansLoading(true)
    let cancelled = false

    async function getFoodPlans() {
      try {
        const response = await getActiveFoodPlansAction()
        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setFoodPlans(response.data ?? [])
      } catch (error) {
        if (cancelled) return
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong!"}`
        )
      } finally {
        if (cancelled) return
        setFoodPlansLoading(false)
      }
    }

    getFoodPlans()

    return () => {
      cancelled = true
    }
  }, [isAssignedFood])

  return (
    <div>
      {isAssignedFood ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Current food plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                This student is on a food plan. Remove it before assigning a new
                one.
              </p>
            </div>
            <RemoveFoodPlanDialog
              studentId={studentId}
              onRelease={bumpHistory}
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Utensils className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Plan
                  </p>
                  <p className="text-sm font-semibold">{food.planName}</p>
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
                    Rs.{food.monthlyFee}/mo
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <span>Started {food.startDate}</span>
            </div>
          </CardContent>
        </Card>
      ) : foodPlansLoading ? (
        <FoodFormSkeleton />
      ) : foodPlans.length > 0 ? (
        <div>
          <AssignFoodPlanForm
            studentId={studentId}
            foodPlans={foodPlans}
            onAssign={bumpHistory}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No food plans available</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create an active food plan in Settings before assigning one.
            </p>
          </CardHeader>
        </Card>
      )}
      <StudentFoodHistory
        studentId={studentId}
        refreshKey={historyRefreshKey}
      />
    </div>
  )
}

function RemoveFoodPlanDialog({
  studentId,
  onRelease,
}: {
  studentId: string
  onRelease: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleRemove() {
    if (isPending) return
    startTransition(async () => {
      try {
        const response = await releaseFoodPlanAction({ studentId })
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
          <XIcon className="size-4" />
          Remove plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove this food plan?</DialogTitle>
          <DialogDescription>
            The plan will be marked as released. You can assign a new plan
            afterward.
          </DialogDescription>
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
            onClick={handleRemove}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Remove plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
