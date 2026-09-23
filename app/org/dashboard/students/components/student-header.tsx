import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"

export default function StudentHeader() {
  return (
    <Card className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-start sm:justify-between">
      <CardContent className="flex items-start gap-2">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <User className="size-5" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Students
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            All students in this hostel.
          </p>
        </div>
      </CardContent>
      <CardContent className=""></CardContent>
    </Card>
  )
}
