"use client"

import { Controller, useFormContext } from "react-hook-form"
import { AdmissionFormType } from "../schema/admission-schema"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function StudentAddress() {
  const { control } = useFormContext<AdmissionFormType>()

  return (
    <FieldSet>
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
    </FieldSet>
  )
}
