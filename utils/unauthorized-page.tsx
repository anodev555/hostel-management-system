"use client"

import Link from "next/link"
import { ArrowLeft, LogIn } from "lucide-react"
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

type UnauthorizedPageProps = {
  title?: string
  description?: string
  hint?: string
  loginHref?: string
  loginLabel?: string
  showBack?: boolean
  className?: string
}

export default function UnauthorizedPage({
  title = "Sign in required",
  description = "Your session has expired or you're not signed in.",
  hint = "Please sign in again to continue to the hostel dashboard.",
  loginHref = "/login",
  loginLabel = "Sign in",
  showBack = true,
  className,
}: UnauthorizedPageProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center justify-center py-16 sm:py-24",
        className
      )}
    >
      <Card className="w-full overflow-hidden border-primary/15 shadow-lg">
        <div
          aria-hidden
          className="h-1 w-full bg-linear-to-r from-primary/40 via-primary to-primary/40"
        />

        <CardHeader className="items-center pb-2 text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <LogIn className="size-8 text-primary" strokeWidth={1.75} />
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

        <CardFooter className="justify-center gap-2 border-t pt-6">
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
