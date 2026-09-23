"use client"
import { ArrowLeft, ShieldX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type ForbiddenPageProps = {
  title?: string
  description?: string
  hint?: string
  backHref?: string
  backLabel?: string
  className?: string
}

export default function ForbiddenPage({
  title = "Access restricted",
  description = "You don't have permission to view this page.",
  hint = "Contact your hostel administrator if you believe you should have access.",

  className,
}: ForbiddenPageProps) {
  const router = useRouter()
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center justify-center py-16 sm:py-24",
        className
      )}
    >
      <Card className="w-full overflow-hidden border-destructive/15 shadow-lg">
        <div
          aria-hidden
          className="h-1 w-full bg-linear-to-r from-destructive/40 via-destructive to-destructive/40"
        />

        <CardHeader className="items-center pb-2 text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
            <ShieldX className="size-8 text-destructive" strokeWidth={1.75} />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="max-w-sm text-balance">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {hint}
          </p>
        </CardContent>

        <CardFooter className="justify-center border-t pt-6">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft />
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
