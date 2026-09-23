'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils";
import { Home, Zap, Wrench, Car, Utensils, MoreHorizontal } from "lucide-react";
import { formatDateYearMonth, formatRupee } from "../../lib/utils";
import { ExpenseDashboardData } from "@/types/expenses-types";
import {Badge} from "@/components/ui/badge"
const CATEGORY_CONFIG: Record<string, { 
  color: string; 
  title: string; 
  icon: React.ReactNode; 
  bgcolor: string;
  textcolor: string;
  iconcolor: string;
  progressbar: string;
}> = {
  rent: { 
    color: "bg-red-500",
    bgcolor: "bg-red-50",
    textcolor: "text-red-900",
    iconcolor: "text-red-600",
    progressbar: "bg-red-500",
    title: "Rent", 
    icon: <Home className="size-4" /> 
  },
  utilities: { 
    color: "bg-emerald-500",
    bgcolor: "bg-emerald-50",
    textcolor: "text-emerald-900",
    iconcolor: "text-emerald-600",
    progressbar: "bg-emerald-500",
    title: "Utilities", 
    icon: <Zap className="size-4" /> 
  },
  maintenance: { 
    color: "bg-amber-500",
    bgcolor: "bg-amber-50",
    textcolor: "text-amber-900",
    iconcolor: "text-amber-600",
    progressbar: "bg-amber-500",
    title: "Repair & Maintenance", 
    icon: <Wrench className="size-4" /> 
  },
  fuel: { 
    color: "bg-blue-500",
    bgcolor: "bg-blue-50",
    textcolor: "text-blue-900",
    iconcolor: "text-blue-600",
    progressbar: "bg-blue-500",
    title: "Fuel", 
    icon: <Car className="size-4" /> 
  },
  food: { 
    color: "bg-purple-500",
    bgcolor: "bg-purple-50",
    textcolor: "text-purple-900",
    iconcolor: "text-purple-600",
    progressbar: "bg-purple-500",
    title: "Food", 
    icon: <Utensils className="size-4" /> 
  },
  other: { 
    color: "bg-slate-500",
    bgcolor: "bg-slate-50",
    textcolor: "text-slate-900",
    iconcolor: "text-slate-600",
    progressbar: "bg-slate-500",
    title: "Others",
    icon: <MoreHorizontal className="size-4" /> 
  },
}
export function ExpenseDashboardStats({
    dashboardData
}:{
    dashboardData: ExpenseDashboardData
}){

     const { categoryRows } = dashboardData;
 const { total} = dashboardData;
 const {date}= dashboardData;
    

    return(
            <div className="grid gap-4">
  {/* Total Summary Card */}
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="text-muted-foreground">Total Expenses of <span> {formatDateYearMonth(date)}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{formatRupee(total)}</div>
    </CardContent>
  </Card>
 
  {/* Category Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4">
    {categoryRows.map((item) => {
      const config = CATEGORY_CONFIG[item.category]
      const percentage = (item.total / Number(total)) * 100
 
      return (
        <Card key={item.category} className={`border-2 ${config.bgcolor} hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-lg", config.bgcolor)}>
                  <div className={cn(config.iconcolor, "size-4")} >{config.icon}</div>
                </div>
                <CardTitle className={cn("text-sm font-semibold", config.textcolor)}>{config.title}</CardTitle>
              </div>
              <Badge className={cn("bg-white/80", config.textcolor, "border-0")}>{percentage.toFixed(2)}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold mb-2", config.textcolor)}>{formatRupee(item.total)}</div>
            <div className={cn("h-2 w-full overflow-hidden rounded-full", "bg-white/60")}>
              <div
                style={{ width: `${percentage}%` }}
                className={cn(config.progressbar, "h-full transition-all rounded-full")}
              />
            </div>
          </CardContent>
        </Card>
      )
    })}
  </div>
</div>
    )
}