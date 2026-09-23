"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ActiveTuitionPlanOption } from "@/types/tuition-types"

import type { AdmissionFormType } from "../schema/admission-schema"

export default function StudentTuition({
  tuitionPlans,
}: {
  tuitionPlans: ActiveTuitionPlanOption[]
}) {
  const { control, watch, setValue } = useFormContext<AdmissionFormType>()

  const wantsTuition = watch("wantsTuition")
  const selectedPlanId = watch("tuitionPlanId")

  const selectedPlan = tuitionPlans.find((plan) => plan.id === selectedPlanId)

  return (
    <FieldSet>
      <FieldLegend>Tuition (optional)</FieldLegend>
      <FieldGroup className="grid gap-4">
        <Controller
          control={control}
          name="wantsTuition"
          render={({ field }) => (
            <Field className="max-w-md">
              <label
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                  field.value && "border-primary bg-primary/5"
                )}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Student takes tuition</p>
                  <p className="text-xs text-muted-foreground">
                    Enable if this student will attend hostel tuition classes.
                    An extra monthly charge applies.
                  </p>
                </div>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const enabled = checked === true
                    field.onChange(enabled)
                    if (!enabled) {
                      setValue("tuitionPlanId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  }}
                />
              </label>
            </Field>
          )}
        />

        {wantsTuition && (
          <Controller
            control={control}
            name="tuitionPlanId"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="admission-tuition-plan">
                  Tuition plan
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="admission-tuition-plan"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Select a tuition plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {tuitionPlans.length > 0 ? (
                      tuitionPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} · Rs. {plan.monthlyPrice}/mo ·{" "}
                          {plan.teacherName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tuition-plans" disabled>
                        No active tuition plans available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Monthly tuition charge snapshot is saved with the student
                  assignment.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        )}

        {wantsTuition && selectedPlan && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Teacher: {selectedPlan.teacherName}</Badge>
            {selectedPlan.teacherSubject ? (
              <Badge variant="outline">{selectedPlan.teacherSubject}</Badge>
            ) : null}
            <Badge variant="outline">Rs. {selectedPlan.monthlyPrice}/mo</Badge>
          </div>
        )}

        {wantsTuition && tuitionPlans.length === 0 && (
          <p className="text-sm text-destructive">
            No active tuition plans are configured. Add one under Settings →
            Tuition or uncheck tuition for this student.
          </p>
        )}
      </FieldGroup>
    </FieldSet>
  )
}
