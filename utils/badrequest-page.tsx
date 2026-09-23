"use client"

import Link from "next/link"
import { ArrowLeft, Building2, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

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

type BadRequestPageProps = {
  title?: string
  description?: string
  hint?: string
  dashboardHref?: string
  dashboardLabel?: string
  loginHref?: string
  loginLabel?: string
  showBack?: boolean
  className?: string
}

export default function BadRequestPage({
  title = "Something isn't set up correctly",
  description = "We couldn't load this page with your current session.",
  hint = "You may need to sign in again or select an active hostel organization.",
  dashboardHref = "/org/dashboard",
  dashboardLabel = "Go to dashboard",
  loginHref = "/login",
  loginLabel = "Sign in again",
  showBack = true,
  className,
}: BadRequestPageProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center justify-center py-16 sm:py-24",
        className
      )}
    >
      <Card className="w-full overflow-hidden border-[color-mix(in_oklch,var(--chart-4)_35%,var(--border))] shadow-lg">
        <div
          aria-hidden
          className="h-1 w-full bg-linear-to-r from-[color-mix(in_oklch,var(--chart-4)_50%,transparent)] via-[var(--chart-4)] to-[color-mix(in_oklch,var(--chart-4)_50%,transparent)]"
        />

        <CardHeader className="items-center pb-2 text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--chart-4)_14%,transparent)] ring-1 ring-[color-mix(in_oklch,var(--chart-4)_30%,transparent)]">
            <Building2
              className="size-8 text-[color-mix(in_oklch,var(--chart-5)_70%,var(--foreground))]"
              strokeWidth={1.75}
            />
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

        <CardFooter className="flex flex-wrap justify-center gap-2 border-t pt-6">
          {showBack && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft />
              Back
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href={dashboardHref}>{dashboardLabel}</Link>
          </Button>
          <Button asChild>
            <Link href={loginHref}>
              <LogIn />
              {loginLabel}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
