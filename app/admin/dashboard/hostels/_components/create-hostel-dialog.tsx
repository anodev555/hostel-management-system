"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateHostelForm } from "./organization-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Divide,
  DivideIcon,
  Eye,
  EyeOff,
  Loader2,
  UserRound,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createOrgSchema,
  CreateOrgSchemaType,
  createOrgWithExistingUserSchema,
  CreateOrgWithExistingUserSchemaType,
} from "../schema/organization-schema";
import {
  createOrganizationAction,
  createOrganizationWithExistingUserAction,
} from "../actions/create-organization";
import { useRouter } from "next/navigation";

export function CreateHostelDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExistingUser, setIsLoadingExistingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const formClass = "flex w-full flex-col gap-4";
  const contentPad = "pt-4";
  const submitSize = "default";
  const fieldGrid = "grid grid-cols-1 gap-4";

  const formwithExistingUser = useForm<CreateOrgWithExistingUserSchemaType>({
    resolver: zodResolver(createOrgWithExistingUserSchema),
    defaultValues: {
      orgName: "",
      location: "",
      ownerUsername: "",
    },
  });

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
  });
  //for formwithnewuser
  async function CreateHostelwithNewUser(values: CreateOrgSchemaType) {
    setIsLoading(true);
    const response = await createOrganizationAction(values);
    if (response.success) {
      toast.success(response.message);
      formwithNewUser.reset();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(response.message);
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors.length > 0) {
            formwithNewUser.setError(name as keyof CreateOrgSchemaType, {
              message: errors[0],
            });
          }
        });
      }
    }
    setIsLoading(false);
  }

  //for formwithexistinguser
  async function CreateHostelwithExistingUser(
    values: CreateOrgWithExistingUserSchemaType,
  ) {
    setIsLoadingExistingUser(true);
    const response = await createOrganizationWithExistingUserAction(values);
    if (response.success) {
      toast.success(response.message);
      formwithExistingUser.reset();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(response.message);
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([name, errors]) => {
          if (errors.length > 0) {
            formwithExistingUser.setError(
              name as keyof CreateOrgWithExistingUserSchemaType,
              {
                message: errors[0],
              },
            );
          }
        });
      }
    }
    setIsLoadingExistingUser(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Create hostel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create hostel</DialogTitle>
          <DialogDescription>
            Provision a new hostel organization and its owner account.
          </DialogDescription>
        </DialogHeader>
        {/* <CreateHostelForm /> */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid  grid-cols-2">
            <TabsTrigger value="new">New owner</TabsTrigger>
            <TabsTrigger value="existing">Existing owner</TabsTrigger>
          </TabsList>
          <TabsContent value="existing">
            <form
              id="create-hostel-with-existing-user-form"
              onSubmit={formwithExistingUser.handleSubmit(
                CreateHostelwithExistingUser,
              )}
              className={formClass}
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

                <CardContent className={contentPad}>
                  <FieldSet>
                    <div className={fieldGrid}>
                      <Controller
                        control={formwithExistingUser.control}
                        name="orgName"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={!!fieldState.error}>
                            <FieldLabel htmlFor="orgName">
                              Hostel name
                            </FieldLabel>
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
                          <Field
                            data-invalid={!!fieldState.error}
                            className="sm:col-span-2"
                          >
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
                    </div>
                  </FieldSet>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card shadow-sm">
                <CardFooter className="flex flex-col-reverse gap-3 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoadingExistingUser}
                    onClick={() => formwithExistingUser.reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    form="create-hostel-with-existing-user-form"
                    size={submitSize}
                    disabled={isLoadingExistingUser}
                  >
                    {isLoadingExistingUser ? (
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
          </TabsContent>
          <TabsContent value="new">
            <form
              id="create-hostel-form"
              onSubmit={formwithNewUser.handleSubmit(CreateHostelwithNewUser)}
              className={formClass}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  <CardContent className={contentPad}>
                    <FieldSet>
                      <div className={fieldGrid}>
                        <Controller
                          control={formwithNewUser.control}
                          name="orgName"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                              <FieldLabel htmlFor="orgName">
                                Hostel name
                              </FieldLabel>
                              <Input
                                id="orgName"
                                placeholder="Sunrise Boys Hostel"
                                disabled={isLoading}
                                aria-invalid={!!fieldState.error}
                                {...field}
                              />
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
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
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
                            </Field>
                          )}
                        />
                      </div>
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

                  <CardContent className={contentPad}>
                    <FieldSet>
                      <div className={fieldGrid}>
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
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
                            </Field>
                          )}
                        />

                        <Controller
                          control={formwithNewUser.control}
                          name="ownerEmail"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                              <FieldLabel htmlFor="ownerEmail">
                                Email
                              </FieldLabel>
                              <Input
                                id="ownerEmail"
                                type="email"
                                autoComplete="email"
                                placeholder="owner@hostel.com"
                                disabled={isLoading}
                                aria-invalid={!!fieldState.error}
                                {...field}
                              />
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
                            </Field>
                          )}
                        />

                        <Controller
                          control={formwithNewUser.control}
                          name="ownerPhone"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                              <FieldLabel htmlFor="ownerPhone">
                                Phone
                              </FieldLabel>
                              <Input
                                id="ownerPhone"
                                type="tel"
                                placeholder="98XXXXXXXX"
                                disabled={isLoading}
                                aria-invalid={!!fieldState.error}
                                {...field}
                              />
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
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
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
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
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
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
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
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
                              <FieldError>
                                {fieldState.error?.message}
                              </FieldError>
                            </Field>
                          )}
                        />
                      </div>
                    </FieldSet>
                  </CardContent>
                </Card>
              </div>

              <div className="border-border/60 bg-card flex flex-row gap-2  items-center p-2 justify-end">
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
                  size={submitSize}
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
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
