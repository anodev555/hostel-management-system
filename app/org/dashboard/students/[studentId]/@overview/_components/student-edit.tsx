"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentOverviewItem } from "@/types/student-type"
import { BedDouble, Info, PencilIcon, School, Utensils } from "lucide-react"
import StudentRoomBedForm from "./roomsbed/student-roombed"
import StudentInfoForm from "./info/student-info"
import StudentFoodForm from "./food/student-food"
import StudentTuition from "./tuition/student-tuition"

export default function StudentEditDialog({
  student,
}: {
  student: StudentOverviewItem
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <PencilIcon className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] w-[calc(100%-2rem)] max-w-5xl flex-col overflow-hidden sm:h-[80vh] sm:max-w-5xl md:h-[80vh] md:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Edit the student details</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="info"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
        >
          <TabsList className="flex h-10 shrink-0 justify-center gap-2">
            <TabsTrigger value="info">
              <Info />
              Info
            </TabsTrigger>
            <TabsTrigger value="room">
              <BedDouble />
              Room
            </TabsTrigger>
            <TabsTrigger value="food">
              <Utensils />
              Food
            </TabsTrigger>
            <TabsTrigger value="tuition">
              <School />
              Tuition
            </TabsTrigger>
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TabsContent value="info">
              <StudentInfoForm student={student} />
            </TabsContent>
            <TabsContent value="room">
              <StudentRoomBedForm
                studentId={student.student.id}
                room={student.room}
              />
            </TabsContent>
            <TabsContent value="food">
              <StudentFoodForm
                studentId={student.student.id}
                food={student.food}
              />
            </TabsContent>
            <TabsContent value="tuition">
              <StudentTuition
                studentId={student.student.id}
                tuition={student.tuition}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
