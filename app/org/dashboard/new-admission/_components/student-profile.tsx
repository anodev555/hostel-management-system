"use client"

import { User, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import type { AdmissionFormType } from "../schema/admission-schema"
import {
  genderValues,
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_SIZE_BYTES,
  profileImageSchema,
} from "../schema/student-profile"

function formatGenderLabel(value: (typeof genderValues)[number]) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

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

function ProfileImageInput({
  value,
  onChange,
  onBlur,
  errorMessage,
}: {
  value: File | undefined
  onChange: (file: File | undefined) => void
  onBlur: () => void
  errorMessage?: string
}) {
  const { setError, clearErrors } = useFormContext<AdmissionFormType>()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(value)

  function validateSelectedFile(file: File | undefined) {
    const result = profileImageSchema.safeParse(file)
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid image file"
      setError("profileImage", { message })
      return false
    }

    clearErrors("profileImage")
    return true
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      onChange(undefined)
      setError("profileImage", { message: "Profile image is required" })
      return
    }

    if (!validateSelectedFile(file)) {
      onChange(undefined)
      event.target.value = ""
      return
    }

    onChange(file)
  }

  function handleRemoveImage() {
    onChange(undefined)
    setError("profileImage", { message: "Profile image is required" })
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <Field className="sm:col-span-4" data-invalid={!!errorMessage}>
      <FieldLabel htmlFor="student-profile-image">
        Profile photo <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-24" data-size="lg">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Profile preview" />
          ) : null}
          <AvatarFallback className="bg-muted">
            <User className="size-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <Input
            ref={inputRef}
            id="student-profile-image"
            type="file"
            accept={PROFILE_IMAGE_ACCEPT}
            required={!value}
            aria-invalid={!!errorMessage}
            onChange={handleFileChange}
            onBlur={onBlur}
          />
          {value ? (
            <p className="text-sm text-muted-foreground">
              Selected: {value.name}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {value ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="mr-1 size-4" />
                Remove
              </Button>
            ) : null}
          </div>
          <FieldDescription>
            Required. JPG, JPEG, or PNG only. Maximum size{" "}
            {Math.round(PROFILE_IMAGE_MAX_SIZE_BYTES / (1024 * 1024))}MB.
          </FieldDescription>
        </div>
      </div>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  )
}

function ProfileImageField() {
  const { control } = useFormContext<AdmissionFormType>()

  return (
    <Controller
      control={control}
      name="profileImage"
      render={({ field, fieldState }) => (
        <ProfileImageInput
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  )
}

export default function StudentProfile() {
  const { control } = useFormContext<AdmissionFormType>()
  const [dobOpen, setDobOpen] = useState(false)
  const [admissionDateOpen, setAdmissionDateOpen] = useState(false)

  return (
    <div className="space-y-8">
      <FieldSet>
        <FieldLegend>Student identity</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-4">
          <ProfileImageField />

          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel htmlFor="student-full-name">Full name</FieldLabel>
                <Input
                  id="student-full-name"
                  placeholder="Student full name"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-email">Email</FieldLabel>
                <Input
                  id="student-email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@example.com"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="studentPhone"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-phone">Phone</FieldLabel>
                <Input
                  id="student-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="98XXXXXXXX"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="collegeOrSchool"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-college">
                  College / school
                </FieldLabel>
                <Input
                  id="student-college"
                  placeholder="College or school name"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="course"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-course">Course</FieldLabel>
                <Input
                  id="student-course"
                  placeholder="e.g. BSc CSIT"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-gender">Gender</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="student-gender"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatGenderLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-dob">Date of birth</FieldLabel>
                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-start font-normal"
                    >
                      {field.value
                        ? field.value.toLocaleDateString("en-US")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? field.value : undefined}
                      defaultMonth={field.value ? field.value : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        field.onChange(date)
                        setDobOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Admission details</FieldLegend>
        <FieldGroup className="grid gap-2 sm:grid-cols-2">
          <Controller
            control={control}
            name="addmissionNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-admission-number">
                  Admission number
                </FieldLabel>
                <Input
                  id="student-admission-number"
                  placeholder="ADM-2026-001"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="addmissionDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-admission-date">
                  Admission date
                </FieldLabel>
                <Popover
                  open={admissionDateOpen}
                  onOpenChange={setAdmissionDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-start font-normal"
                    >
                      {field.value
                        ? field.value.toLocaleDateString("en-US")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? field.value : undefined}
                      defaultMonth={field.value ? field.value : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        field.onChange(date)
                        setDobOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* <FieldSet>
        <FieldLegend>Address</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-3">
          <Controller
            control={control}
            name="province"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-province">Province</FieldLabel>
                <Input
                  id="student-province"
                  placeholder="Province"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />

                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="district"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-district">District</FieldLabel>
                <Input
                  id="student-district"
                  placeholder="District"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-city">City</FieldLabel>
                <Input
                  id="student-city"
                  placeholder="City"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="municipality"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-municipality">
                  Municipality
                </FieldLabel>
                <Input
                  id="student-municipality"
                  placeholder="Municipality"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="ward"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-ward">Ward</FieldLabel>
                <Input
                  id="student-ward"
                  inputMode="numeric"
                  placeholder="1"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet> */}

      {/* <FieldSet>
        <FieldLegend>Parent / guardian</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="fatherName"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-father-name">
                  Father&apos;s name
                </FieldLabel>
                <Input
                  id="student-father-name"
                  placeholder="Father's full name"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="motherName"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-mother-name">
                  Mother&apos;s name
                </FieldLabel>
                <Input
                  id="student-mother-name"
                  placeholder="Mother's full name"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="guardianPhone1"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-guardian-phone-1">
                  Guardian phone 1
                </FieldLabel>
                <Input
                  id="student-guardian-phone-1"
                  type="tel"
                  inputMode="tel"
                  placeholder="98XXXXXXXX"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="guardianPhone2"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="student-guardian-phone-2">
                  Guardian phone 2
                </FieldLabel>
                <Input
                  id="student-guardian-phone-2"
                  type="tel"
                  inputMode="tel"
                  placeholder="Optional"
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                <FieldDescription>
                  Optional secondary contact number.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet> */}
    </div>
  )
}
