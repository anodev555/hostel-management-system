"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  Divide,
  DivideIcon,
  Eye,
  EyeOff,
  Loader2,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  createOrgSchema,
  CreateOrgSchemaType,
  createOrgWithExistingUserSchema,
  CreateOrgWithExistingUserSchemaType,
} from "../schema/organizationSchema"
import {
  createOrganizationAction,
  createOrganizationWithExistingUserAction,
} from "../action/create-organization"

export function CreateHostelForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExistingUser, setIsLoadingExistingUser] = useState(false)
  const [isforExistingUser, setIsforExistingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formwithExistingUser = useForm<CreateOrgWithExistingUserSchemaType>({
    resolver: zodResolver(createOrgWithExistingUserSchema),
    defaultValues: {
      orgName: "",
      location: "",
      ownerUsername: "",
    },
  })

  const formwithNewUser = useForm<CreateOrgSchemaType>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      orgName: "",
      location: "",
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerUsername: "",
      ownerPassword: "",
      confirmPassword: "",
    },
  })
  //for formwithnewuser
  async function CreateHostelwithNewUser(values: CreateOrgSchemaType) {
    setIsLoading(true)
    const response = await createOrganizationAction(values)
    if (response.success) {
      toast.success(response.message)
      formwithNewUser.reset()
    } else {
      toast.error(response.message)
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors.length > 0) {
            formwithNewUser.setError(name as keyof CreateOrgSchemaType, {
              message: errors[0],
            })
          }
        })
      }
    }
    setIsLoading(false)
  }

  //for formwithexistinguser
  async function CreateHostelwithExistingUser(
    values: CreateOrgWithExistingUserSchemaType
  ) {
    setIsLoadingExistingUser(true)
    const response = await createOrganizationWithExistingUserAction(values)
    if (response.success) {
      toast.success(response.message)
      formwithExistingUser.reset()
    } else {
      toast.error(response.message)
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors.length > 0) {
            formwithExistingUser.setError(
              name as keyof CreateOrgWithExistingUserSchemaType,
              {
                message: errors[0],
              }
            )
          }
        })
      }
    }
    setIsLoadingExistingUser(false)
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create Hostel
        </h1>
        <p className="text-sm text-muted-foreground">
          Provision a new hostel organization and its owner account.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsforExistingUser(!isforExistingUser)}
        >
          {isforExistingUser ? "Create New Hostel" : "Use Existing User"}
        </Button>
      </div>
      {isforExistingUser ? (
        <form
          id="create-hostel-with-existing-user-form"
          onSubmit={formwithExistingUser.handleSubmit(
            CreateHostelwithExistingUser
          )}
          className="mx-auto flex w-full max-w-7xl flex-col gap-2"
        >
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <CardTitle>Hostel details</CardTitle>
                  <CardDescription>
                    Basic information about the hostel organization.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <FieldSet>
                <FieldGroup>
                  <Controller
                    control={formwithExistingUser.control}
                    name="orgName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="orgName">Hostel name</FieldLabel>
                        <Input
                          id="orgName"
                          placeholder="Sunrise Boys Hostel"
                          disabled={isLoading}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    control={formwithExistingUser.control}
                    name="location"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="location">
                          Location{" "}
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FieldLabel>
                        <Input
                          id="location"
                          placeholder="Kathmandu, Nepal"
                          disabled={isLoading}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    control={formwithExistingUser.control}
                    name="ownerUsername"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel htmlFor="ownerUsername">
                          Owner Username{" "}
                          <span className="font-normal text-muted-foreground"></span>
                        </FieldLabel>
                        <Input
                          id="ownerUsername"
                          placeholder="ownerusername"
                          disabled={isLoading}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card shadow-sm">
            <CardFooter className="flex flex-col-reverse gap-3 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => formwithExistingUser.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                form="create-hostel-with-existing-user-form"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating hostel…
                  </>
                ) : (
                  "Create hostel"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <form
          id="create-hostel-form"
          onSubmit={formwithNewUser.handleSubmit(CreateHostelwithNewUser)}
          className="mx-auto flex w-full max-w-7xl flex-col gap-2"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hostel details */}
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Hostel details</CardTitle>
                    <CardDescription>
                      Basic information about the hostel organization.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <FieldSet>
                  <FieldGroup>
                    <Controller
                      control={formwithNewUser.control}
                      name="orgName"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="orgName">Hostel name</FieldLabel>
                          <Input
                            id="orgName"
                            placeholder="Sunrise Boys Hostel"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="location"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="location">
                            Location{" "}
                            <span className="font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </FieldLabel>
                          <Input
                            id="location"
                            placeholder="Kathmandu, Nepal"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Owner account */}
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Owner account</CardTitle>
                    <CardDescription>
                      Credentials for the hostel owner (org admin).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <FieldSet>
                  <FieldGroup>
                    <Controller
                      control={formwithNewUser.control}
                      name="ownerFullName"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="ownerFullName">
                            Full name
                          </FieldLabel>
                          <Input
                            id="ownerFullName"
                            placeholder="Ram Sharma"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="ownerEmail"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="ownerEmail">Email</FieldLabel>
                          <Input
                            id="ownerEmail"
                            type="email"
                            autoComplete="email"
                            placeholder="owner@hostel.com"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="ownerPhone"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="ownerPhone">Phone</FieldLabel>
                          <Input
                            id="ownerPhone"
                            type="tel"
                            placeholder="98XXXXXXXX"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="ownerUsername"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="ownerUsername">
                            Username
                          </FieldLabel>
                          <Input
                            id="ownerUsername"
                            autoComplete="username"
                            placeholder="8–15 characters"
                            disabled={isLoading}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldDescription>
                            Used for login. 8-15 characters.
                          </FieldDescription>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="ownerPassword"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="ownerPassword">
                            Password
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id="ownerPassword"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="••••••••"
                              disabled={isLoading}
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                              >
                                {showPassword ? (
                                  <Eye className="size-4" />
                                ) : (
                                  <EyeOff className="size-4" />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />

                    <Controller
                      control={formwithNewUser.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                          <FieldLabel htmlFor="confirmPassword">
                            Confirm password
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="••••••••"
                              disabled={isLoading}
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword((v) => !v)
                                }
                              >
                                {showConfirmPassword ? (
                                  <Eye className="size-4" />
                                ) : (
                                  <EyeOff className="size-4" />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-card shadow-sm">
            <CardFooter className="flex flex-col-reverse gap-3 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => formwithNewUser.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                form="create-hostel-form"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating hostel…
                  </>
                ) : (
                  "Create hostel"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </>
  )
}
