"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ExpenseFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined
  )

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (fromDate) {
      params.set("from", format(fromDate, "yyyy-MM-dd"))
    } else {
      params.delete("from")
    }
    
    if (toDate) {
      params.set("to", format(toDate, "yyyy-MM-dd"))
    } else {
      params.delete("to")
    }
    
    // Reset to page 1 when filters change
    params.delete("page")
    
    router.push(`/org/dashboard/expenses?${params.toString()}`)
  }

  const clearFilters = () => {
    setFromDate(undefined)
    setToDate(undefined)
    router.push("/org/dashboard/expenses")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center p-4 bg-muted/50 rounded-lg">
      <div  className="">
        {/* <Label>From Date</Label> */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-40 justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "MMM dd, yyyy") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              captionLayout="dropdown"
            
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className=" ">
        {/* <Label>To Date</Label> */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-40 justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "MMM dd, yyyy") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 items-center">
        <Button onClick={updateFilters} className="gap-2">
          <Search className="h-4 w-4" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}