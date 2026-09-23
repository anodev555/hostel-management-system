"use client"

import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

import TuitionForm from "./tuition-form"

export default function TuitionHeader() {
  return (
    <Card className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <CardContent className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <GraduationCap className="size-5" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tuition plans
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Create tuition plans with teacher details. Assign plans to students
            during admission or from their profile.
          </p>
        </div>
      </CardContent>
      <CardContent className="shrink-0 sm:pt-1">
        <TuitionForm />
      </CardContent>
    </Card>
  )
}
