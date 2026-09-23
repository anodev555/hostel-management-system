"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, User, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, type Control } from "react-hook-form"

import {
  editStudentInfoSchema,
  genderValues,
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_SIZE_BYTES,
  studentStatusValues,
  type StudentInfoSchemaType,
} from "../../schema/studentInfoSchema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { StudentOverviewItem } from "@/types/student-type"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateStudentInfoAction } from "../../action/update-student"

function formatGenderLabel(value: (typeof genderValues)[number]) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatStatusLabel(value: (typeof studentStatusValues)[number]) {
  if (value === "checkedOut") return "Checked out"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function parseDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function studentToFormValues(
  overview: StudentOverviewItem
): StudentInfoSchemaType {
  const student = overview.student

  return {
    studentId: student.id,
    fullName: student.fullName,
    email: student.email,
    studentPhone: student.studentPhone,
    collegeOrSchool: student.collegeOrSchool,
    course: student.course,
    profileImage: undefined,
    province: student.province,
    district: student.district,
    city: student.city,
    municipality: student.municipality,
    ward: String(student.ward),
    dateOfBirth: parseDate(student.dateOfBirth),
    gender: student.gender as StudentInfoSchemaType["gender"],
    status: student.status as StudentInfoSchemaType["status"],
    fatherName: student.fatherName,
    motherName: student.motherName,
    guardianPhone1: student.guardianPhone1,
    guardianPhone2: student.guardianPhone2 ?? "",
  }
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

function EditProfileImageInput({
  value,
  onChange,
  onBlur,
  existingImagePath,
  errorMessage,
}: {
  value: File | undefined
  onChange: (file: File | undefined) => void
  onBlur: () => void
  existingImagePath: string | null
  errorMessage?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(value)
  const displayUrl = previewUrl
    ? previewUrl
    : existingImagePath
      ? `/${existingImagePath}`
      : null

  return (
    <Field className="sm:col-span-2" data-invalid={!!errorMessage}>
      <FieldLabel htmlFor="edit-student-profile-image">
        Profile photo
      </FieldLabel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          {displayUrl ? <AvatarImage src={displayUrl} alt="Profile" /> : null}
          <AvatarFallback className="bg-muted">
            <User className="size-7 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <Input
            ref={inputRef}
            id="edit-student-profile-image"
            type="file"
            accept={PROFILE_IMAGE_ACCEPT}
            aria-invalid={!!errorMessage}
            onChange={(event) => {
              const file = event.target.files?.[0]
              onChange(file ?? undefined)
            }}
            onBlur={onBlur}
          />
          {value ? (
            <p className="text-sm text-muted-foreground">
              Selected: {value.name}
            </p>
          ) : null}
          {value ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                onChange(undefined)
                if (inputRef.current) {
                  inputRef.current.value = ""
                }
              }}
            >
              <X className="size-4" />
              Remove new photo
            </Button>
          ) : null}
          <FieldDescription>
            Optional. Leave empty to keep current photo. JPG, JPEG, or PNG. Max{" "}
            {Math.round(PROFILE_IMAGE_MAX_SIZE_BYTES / (1024 * 1024))}MB.
          </FieldDescription>
        </div>
      </div>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  )
}

function ProfileImageField({
  control,
  existingImagePath,
}: {
  control: Control<StudentInfoSchemaType>
  existingImagePath: string | null
}) {
  return (
    <Controller
      control={control}
      name="profileImage"
      render={({ field, fieldState }) => (
        <EditProfileImageInput
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          existingImagePath={existingImagePath}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  )
}

export default function StudentInfoForm({
  student,
}: {
  student: StudentOverviewItem
}) {
  const defaultValues = useMemo(() => studentToFormValues(student), [student])
  const [dobOpen, setDobOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<StudentInfoSchemaType>({
    resolver: zodResolver(editStudentInfoSchema),
    defaultValues,
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    reset(studentToFormValues(student))
  }, [student, reset])

  async function onSubmit(_data: StudentInfoSchemaType) {
    setIsLoading(true)
    try {
      const response = await updateStudentInfoAction(_data)
      if (response.success) {
        toast.success(response.message)
        reset({ ..._data, profileImage: undefined })
        router.refresh()
        return
      }
      if (!response.success) {
        toast.error(response.message)

        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as keyof StudentInfoSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : "Something went wrong!"}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form
        id="student-info-form"
        className="space-y-6 px-2 py-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input type="hidden" {...form.register("studentId")} />

        <FieldSet>
          <FieldLegend>Personal information</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <ProfileImageField
              control={control}
              existingImagePath={student.student.profileImage}
            />

            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="edit-full-name">Full name</FieldLabel>
                  <Input
                    id="edit-full-name"
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
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                  <Input
                    id="edit-email"
                    type="email"
                    autoComplete="email"
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
                  <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
                  <Input
                    id="edit-phone"
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
                  <FieldLabel htmlFor="edit-college">
                    College / school
                  </FieldLabel>
                  <Input
                    id="edit-college"
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
                  <FieldLabel htmlFor="edit-course">Course</FieldLabel>
                  <Input
                    id="edit-course"
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
                  <FieldLabel htmlFor="edit-gender">Gender</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-gender"
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
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-status"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentStatusValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatStatusLabel(value)}
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
                  <FieldLabel htmlFor="edit-dob">Date of birth</FieldLabel>
                  <Popover open={dobOpen} onOpenChange={setDobOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        id="edit-dob"
                        className={cn(
                          "w-full justify-start font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="size-4" />
                        {field.value
                          ? field.value.toLocaleDateString("en-US")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date)
                            setDobOpen(false)
                          }
                        }}
                        captionLayout="dropdown"
                        defaultMonth={field.value}
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
          <FieldLegend>Address</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="province"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="edit-province">Province</FieldLabel>
                  <Input
                    id="edit-province"
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
                  <FieldLabel htmlFor="edit-district">District</FieldLabel>
                  <Input
                    id="edit-district"
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
                  <FieldLabel htmlFor="edit-city">City</FieldLabel>
                  <Input
                    id="edit-city"
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
                  <FieldLabel htmlFor="edit-municipality">
                    Municipality
                  </FieldLabel>
                  <Input
                    id="edit-municipality"
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
                  <FieldLabel htmlFor="edit-ward">Ward</FieldLabel>
                  <Input
                    id="edit-ward"
                    inputMode="numeric"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Parent & guardian</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="fatherName"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="edit-father">
                    {"Father's name"}
                  </FieldLabel>
                  <Input
                    id="edit-father"
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
                  <FieldLabel htmlFor="edit-mother">
                    {"Mother's name"}
                  </FieldLabel>
                  <Input
                    id="edit-mother"
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
                  <FieldLabel htmlFor="edit-guardian-phone-1">
                    Guardian phone 1
                  </FieldLabel>
                  <Input
                    id="edit-guardian-phone-1"
                    type="tel"
                    inputMode="tel"
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
                  <FieldLabel htmlFor="edit-guardian-phone-2">
                    Guardian phone 2
                  </FieldLabel>
                  <Input
                    id="edit-guardian-phone-2"
                    type="tel"
                    inputMode="tel"
                    placeholder="Optional"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-popover pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => reset(defaultValues)}
          >
            Reset
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save info"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
