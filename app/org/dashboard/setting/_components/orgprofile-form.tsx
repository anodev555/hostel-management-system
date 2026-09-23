"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import OrgHeader from "./org-header"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import {
  orgProfileLogoSchema,
  OrgProfileLogoType,
  orgProfileSchema,
  OrgProfileType,
} from "../schema/orgprofile"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { useEffect, useMemo, useState } from "react"
import { Building2, Loader2 } from "lucide-react"
import {
  updateOrganizationProfileAction,
  uploadOrgProfileLogo,
} from "../action/orgprofile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { OrganizationProfileType } from "@/types/organization-type"
import { FormSaveBar } from "../../_components/form-save-bar"

function useObjectUrl(file: File | undefined) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return url
}

function profileToFormValues(
  organizationProfile: OrganizationProfileType
): OrgProfileType {
  return {
    name: organizationProfile.name,
    location: organizationProfile.location ?? "",
  }
}

export default function OrgProfileForm({
  organizationProfile,
}: {
  organizationProfile: OrganizationProfileType
}) {
  const [isPending, setIsPending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [logoPath, setLogoPath] = useState(organizationProfile.logo)
  const router = useRouter()

  const defaultValues = useMemo(
    () => profileToFormValues(organizationProfile),
    [organizationProfile.name, organizationProfile.location]
  )

  const logoForm = useForm<OrgProfileLogoType>({
    resolver: zodResolver(orgProfileLogoSchema),
    defaultValues: {
      orgProfileLogo: undefined,
    },
  })

  const profileForm = useForm<OrgProfileType>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues,
  })

  const selectedLogo = logoForm.watch("orgProfileLogo")
  const previewUrl = useObjectUrl(selectedLogo)
  const displayUrl = previewUrl ? previewUrl : logoPath ? `/${logoPath}` : null

  useEffect(() => {
    setLogoPath(organizationProfile.logo)
  }, [organizationProfile.logo])

  useEffect(() => {
    profileForm.reset(defaultValues)
  }, [defaultValues, profileForm])

  async function uploadLogo(data: OrgProfileLogoType) {
    if (isPending) return
    setIsPending(true)
    try {
      const response = await uploadOrgProfileLogo(data)
      if (response.success) {
        toast.success(response.message)
        setLogoPath(response.data.logo)
        logoForm.reset({ orgProfileLogo: undefined })
        router.refresh()
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              logoForm.setError(field as keyof OrgProfileLogoType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      console.error(error)
      logoForm.reset({ orgProfileLogo: undefined })
      toast.error(
        `${error instanceof Error ? error.message : "Something went wrong!"}`
      )
    } finally {
      setIsPending(false)
    }
  }

  async function updateProfile(data: OrgProfileType) {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      const response = await updateOrganizationProfileAction(data)
      if (response.success) {
        toast.success(response.message)
        profileForm.reset(data)
        router.refresh()
        return
      }
      toast.error(response.message)
      if (response.fieldErrors) {
        Object.entries(response.fieldErrors).forEach(([field, errors]) => {
          if (errors && errors.length > 0) {
            profileForm.setError(field as keyof OrgProfileType, {
              message: errors[0],
            })
          }
        })
      }
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : "Something went wrong!"}`
      )
    } finally {
      setIsUpdating(false)
    }
  }

  function handleReset() {
    profileForm.reset(defaultValues)
  }

  return (
    <div className="space-y-6 pb-24">
      <OrgHeader />
      <Card>
        <CardHeader>
          <CardTitle>Hostel details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <form onSubmit={logoForm.handleSubmit(uploadLogo)}>
              <Field>
                <FieldLabel htmlFor="orgProfileLogo">Logo</FieldLabel>
                <div className="flex h-9 items-center gap-3">
                  <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {displayUrl ? (
                      <img
                        src={displayUrl}
                        alt={`${organizationProfile.name} logo`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Building2 className="size-4 text-muted-foreground" />
                    )}
                    {isPending ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : null}
                  </div>
                  <Controller
                    control={logoForm.control}
                    name="orgProfileLogo"
                    render={({ field, fieldState }) => (
                      <div className="min-w-0 flex-1">
                        <Input
                          id="orgProfileLogo"
                          type="file"
                          className="h-9"
                          disabled={isPending}
                          accept="image/png, image/jpeg, image/jpg"
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file)
                            if (file) {
                              logoForm.handleSubmit(uploadLogo)()
                            }
                          }}
                        />
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </div>
                    )}
                  />
                </div>
                <FieldDescription>PNG, JPEG, or JPG. Max 5MB.</FieldDescription>
              </Field>
            </form>

            <form
              onSubmit={profileForm.handleSubmit(updateProfile)}
              className="contents"
            >
              <Controller
                control={profileForm.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="org-name">Name</FieldLabel>
                    <Input
                      id="org-name"
                      disabled={isUpdating}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                control={profileForm.control}
                name="location"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="org-location">Location</FieldLabel>
                    <Input
                      id="org-location"
                      disabled={isUpdating}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </form>
          </div>
        </CardContent>
      </Card>
      <FormSaveBar
        isDirty={profileForm.formState.isDirty}
        onReset={handleReset}
        isLoading={isUpdating}
        onConfirm={profileForm.handleSubmit(updateProfile)}
        message="unsaved changes"
        dialogTitle="Save organization profile?"
        dialogDescription="Name and location will be updated for this hostel."
        confirmLabel="Confirm update"
      />
    </div>
  )
}
