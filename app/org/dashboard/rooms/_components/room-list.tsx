import Link from "next/link"
import { Bath, BedDouble, DoorOpen, Fan, Snowflake } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RoomInfoWithStudents } from "@/types/room-type"
import { formatRupee } from "../../lib/utils"

export default function RoomList({
  roomsInfo,
}: {
  roomsInfo: RoomInfoWithStudents[]
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Rooms</h1>
        <p className="text-sm text-muted-foreground">
          All rooms with occupancy, plan, and features
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roomsInfo.map((roomInfo) => (
          <Card
            key={roomInfo.room.roomId}
            className="overflow-hidden border-border/60 py-0 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <CardHeader className="gap-3 border-b bg-muted/30 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                      Room
                    </span>
                    <span className="font-bold tracking-tight">
                      {roomInfo.room.roomNumber}
                    </span>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium ring-1 ring-border">
                      Floor {roomInfo.room.floor}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <BedDouble className="size-3.5 shrink-0" />
                      {roomInfo.room.totalBeds} beds
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Fan className="size-3.5 shrink-0" />
                      {roomInfo.room.fans} fans
                    </span>
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {roomInfo.room.attachedBathroom && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
                      <Bath className="size-3.5 shrink-0" />
                      <span className="hidden sm:inline">Bathroom</span>
                    </span>
                  )}
                  {roomInfo.room.airConditioner && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <Snowflake className="size-3.5 shrink-0" />
                      AC
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 px-4 py-2 sm:px-5">
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Lodging plan
                  </p>
                  <p className="mt-0.5 text-sm font-medium capitalize">
                    {roomInfo.room.planName ?? "—"}
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                    {formatRupee(roomInfo.room.monthlyPrice ?? 0)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                  <Badge
                    className={
                      roomInfo.vacantBeds > 0
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                    }
                  >
                    {roomInfo.vacantBeds > 0
                      ? `${roomInfo.vacantBeds} vacant`
                      : "Full"}
                  </Badge>
                  <span className="text-xs text-muted-foreground sm:text-right">
                    {roomInfo.occupiedBeds}/{roomInfo.room.totalBeds} occupied
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Current occupants
                </p>

                {roomInfo.students.length > 0 ? (
                  <div className="divide-y rounded-xl border">
                    {roomInfo.students.map((student) => (
                      <Link
                        key={student.studentId}
                        href={`/org/dashboard/students/${student.studentId}`}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="size-9 shrink-0 ring-2 ring-background">
                            <AvatarImage src={`/${student.studentProfile}`} />
                            <AvatarFallback className="text-xs font-semibold">
                              {student.studentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="truncate text-sm font-medium">
                            {student.studentName}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 tabular-nums"
                        >
                          Bed {student.bedNumber}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-2 text-center">
                    <DoorOpen className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Fully vacant
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {roomInfo.vacantBeds} bed
                      {roomInfo.vacantBeds !== 1 ? "s" : ""} available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
