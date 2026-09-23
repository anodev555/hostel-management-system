"use client"

import { Controller, useFormContext } from "react-hook-form"
import { AdmissionFormType } from "../schema/admission-schema"
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

export default function StudentParentDetail() {
  const { control } = useFormContext<AdmissionFormType>()
  return (
    <FieldSet>
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
    </FieldSet>
  )
}
