"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/authClient"
import { getDashboardForRole } from "@/lib/get-dashboard-for-role"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../components/ui/input-group"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginSchemaType = z.infer<typeof loginSchema>

const enter =
  "animate-in fade-in fill-mode-backwards duration-700 ease-out motion-reduce:animate-none motion-reduce:opacity-100"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(credentials: LoginSchemaType) {
    if (credentials.username.length < 8 || credentials.username.length > 15) {
      toast.error("Invalid username or password")
      return
    }

    try {
      setIsLoading(true)
      const { error, data } = await authClient.signIn.username({
        username: credentials.username,
        password: credentials.password,
      })

      if (error) {
        toast.error("Invalid username or password")
        return
      }

      if (!data) {
        toast.error("Something went wrong. Please try again.")
        return
      }

      router.push(getDashboardForRole(data.user.role) ?? "/")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className={cn(
          enter,
          "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors delay-0 slide-in-from-left-2 hover:text-foreground"
        )}
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <div
        className={cn(
          enter,
          "overflow-hidden rounded-2xl border border-border/60 bg-card/85 shadow-lg backdrop-blur-md delay-100 slide-in-from-bottom-6"
        )}
      >
        <div className="border-b border-border/50 bg-primary/5 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to your Hostel Management System account
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className="h-11 pl-10"
                    placeholder="your username"
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </div>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <InputGroup>
                    <InputGroupInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-11 pl-10"
                      placeholder="••••••••"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="border-t border-border/50 px-6 py-4 text-center text-xs leading-relaxed text-muted-foreground">
          Accounts are created by your administrator. Contact them if you need
          access.
        </p>
      </div>
    </div>
  )
}
