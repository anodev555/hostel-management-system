
import Link from "next/link"
import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Building2,
    title: "Multi-hostel management",
    description:
      "Run every property from one platform with clear org boundaries.",
  },
  {
    icon: Users,
    title: "Role-based access",
    description:
      "Super admins, org admins, and staff each see only what they need.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "No public signup — accounts are provisioned by administrators only.",
  },
]

const enter =
  "animate-in fade-in fill-mode-backwards duration-700 ease-out motion-reduce:animate-none motion-reduce:opacity-100"

export default function HeroSection() {
  return (
    <div className="relative min-h-screen w-full bg-white">
      {/* Dual Gradient Overlay (Top) Background */}
      <div
        className="absolute inset-0 z-0 animate-in duration-1000 ease-out fade-in motion-reduce:animate-none"
        style={{
          backgroundImage: `
        linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
        radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
        radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
      `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
      <section className="relative min-h-svh overflow-hidden">
        {/* Background
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1/4 -left-24 size-72 rounded-full bg-accent blur-3xl"
        /> */}

        <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col px-6 py-10">
          {/* Nav */}
          <header
            className={cn(
              enter,
              "flex items-center justify-between delay-0 slide-in-from-top-4"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Building2 className="size-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">HMS</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </header>

          {/* Hero */}
          <div className="flex flex-1 flex-col justify-center gap-14 py-16 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p
                className={cn(
                  enter,
                  "mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary delay-100 zoom-in-95 slide-in-from-bottom-3"
                )}
              ></p>
              <h1
                className={cn(
                  enter,
                  "text-4xl font-bold tracking-tight text-foreground delay-200 slide-in-from-bottom-4 sm:text-5xl lg:text-6xl"
                )}
              >
                Manage your hostel{" "}
                <span className="text-primary">without the chaos</span>
              </h1>
              <p
                className={cn(
                  enter,
                  "mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground delay-300 slide-in-from-bottom-4 sm:text-lg"
                )}
              >
                Rooms, residents, staff, and permissions — organized in one
                place. Built for multi-tenant hostel operations with
                admin-controlled access.
              </p>
              <div
                className={cn(
                  enter,
                  "mt-10 flex flex-col items-center justify-center gap-3 delay-400 slide-in-from-bottom-4 sm:flex-row"
                )}
              >
                <Button size="lg" asChild>
                  <Link href="/login">
                    Login to continue
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                {/* <Button size="lg" variant="secondary" asChild>
                  <Link href="#features">See features</Link>
                </Button> */}
              </div>
            </div>

            {/* Feature cards */}
            <div id="features" className="grid gap-4 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className={cn(
                    enter,
                    "rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm slide-in-from-bottom-6",
                    index === 0 && "delay-500",
                    index === 1 && "delay-600",
                    index === 2 && "delay-700"
                  )}
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Your Content/Components */}
    </div>
  )
}
