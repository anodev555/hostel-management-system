"use client"

import { getAvailableRoomsAction } from "@/app/org/dashboard/lib/shared/get-availableroom"
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
import { AvailableRoomOption } from "@/types/room-type"
import { StudentOverviewItem } from "@/types/student-type"
import {
  BedDouble,
  DoorOpen,
  Layers,
  Loader2Icon,
  LogOutIcon,
} from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import LoadingBar from "@/components/loading-bar"
import AssignRoomForm from "./assignroom-form"
import StudentRoomHistory from "./student-roomhistory"
import { releaseStudentAction } from "../../action/release-studentroom"
import RoomFormSkeleton from "./room-skeleton"

type StudentRoomBedFormProps = {
  studentId: string
  room: StudentOverviewItem["room"]
}

export default function StudentRoomBedForm({
  studentId,
  room,
}: StudentRoomBedFormProps) {
  const isAssignedRoom = room !== null
  const [roomOptions, setRoomOptions] = useState<AvailableRoomOption[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const bumpHistory = () => setHistoryRefreshKey((k) => k + 1)

  useEffect(() => {
    if (isAssignedRoom) {
      setRoomOptions([])
      setRoomsLoading(false)
      return
    }

    setRoomsLoading(true)
    let cancelled = false

    async function getRooms() {
      try {
        const response = await getAvailableRoomsAction()

        if (cancelled) return
        if (!response.success) {
          toast.error(response.message)
          return
        }

        setRoomOptions(response.data.filter((item) => !item.isFull))
      } catch (error) {
        if (cancelled) return
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong!"}`
        )
      } finally {
        if (cancelled) return
        setRoomsLoading(false)
      }
    }

    getRooms()

    return () => {
      cancelled = true
    }
  }, [isAssignedRoom])

  return (
    <div>
      {isAssignedRoom ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">
                Current room assignment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This student is assigned to a room. Release it before selecting
                a new one.
              </p>
            </div>
            <ReleaseDialog studentId={studentId} onRelease={bumpHistory} />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <DoorOpen className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Room
                  </p>
                  <p className="text-sm font-semibold">
                    {room.roomNumber ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Layers className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Floor
                  </p>
                  <p className="text-sm font-semibold">{room.floor ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BedDouble className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Bed
                  </p>
                  <p className="text-sm font-semibold">{room.bedNumber}</p>
                </div>
              </div>
            </div>
            {room.lodgingPlanName ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {room.lodgingPlanName}
                {room.monthlyFee ? ` · Rs.${room.monthlyFee}/mo` : null}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : roomsLoading ? (
        <RoomFormSkeleton />
      ) : roomOptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No rooms available</CardTitle>
            <p className="text-sm text-muted-foreground">
              Every active room is full. Free a bed or add a room in Settings
              before assigning this student.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <div>
          <AssignRoomForm
            studentId={studentId}
            rooms={roomOptions}
            onAssign={bumpHistory}
          />
        </div>
      )}
      <StudentRoomHistory
        studentId={studentId}
        refreshKey={historyRefreshKey}
      />
    </div>
  )
}

function ReleaseDialog({
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
        const response = await releaseStudentAction({ studentId })
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
          Release
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to release this student from their room?
          </DialogTitle>
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
