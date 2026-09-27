"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MinusCircle } from "lucide-react";
import { Controller, type Control } from "react-hook-form";

export const DEDUCTION_REASONS = [
  { label: "Advance", value: "advance" },
  { label: "Loan", value: "loan" },
  { label: "Fine", value: "fine" },
  { label: "Other", value: "other" },
];

export function DeductionFormFields({
  control,
  idPrefix,
}: {
  control: Control<any>;
  idPrefix: string;
}) {
  return (
    <FieldSet>
      <FieldGroup>
        <Controller
          control={control}
          name="reason"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Reason</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!fieldState.error}>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {DEDUCTION_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      <span className="inline-flex items-center gap-2">
                        <MinusCircle className="size-3.5 text-muted-foreground" />
                        {reason.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error ? (
                <FieldError>{fieldState.error.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={`${idPrefix}-amount`}>
                Amount (Rs.)
              </FieldLabel>
              <Input
                id={`${idPrefix}-amount`}
                inputMode="decimal"
                placeholder="e.g. 1500.00"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              <FieldDescription>
                Cannot exceed the remaining gross salary after other deductions.
              </FieldDescription>
              {fieldState.error ? (
                <FieldError>{fieldState.error.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor={`${idPrefix}-description`}>
                Description (optional)
              </FieldLabel>
              <Textarea
                id={`${idPrefix}-description`}
                rows={2}
                placeholder="e.g. Advance salary taken on 15th"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              {fieldState.error ? (
                <FieldError>{fieldState.error.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
