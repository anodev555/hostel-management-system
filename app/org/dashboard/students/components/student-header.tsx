import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"

export default function StudentHeader() {
  return (
    
    <div className="flex items-center justify-between">
      <div className="flex flex-col ">
        <h2 className="text-2xl font-bold">Students</h2>
        <p className="text-sm text-muted-foreground">All students in this hostel</p>
      </div>
    </div>
  )
}
