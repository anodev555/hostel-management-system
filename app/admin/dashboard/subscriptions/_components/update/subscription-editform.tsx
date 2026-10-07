"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PlanListItem } from "@/types/subscription-types";

import { updateSubscriptionPlanAction } from "../../actions/update-subscription";
import {
  updateSubscriptionPlanSchema,
  type UpdateSubscriptionPlanSchemaType,
} from "../../schema/subscription-schema";

function toPlanDefaults(plan: PlanListItem): UpdateSubscriptionPlanSchemaType {
  return {
    planId: plan.id,
    name: plan.name,
    description: plan.description ?? "",
    price: plan.price ?? "",
    maxStudents: plan.maxStudents?.toString() ?? "",
    maxStaff: plan.maxStaff?.toString() ?? "",
  };
}

export default function SubscriptionEditForm({ plan }: { plan: PlanListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateSubscriptionPlanSchemaType>({
    resolver: zodResolver(updateSubscriptionPlanSchema),
    defaultValues: toPlanDefaults(plan),
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      form.reset(toPlanDefaults(plan));
    }
  }

  async function onSubmit(values: UpdateSubscriptionPlanSchemaType) {
    setIsLoading(true);
    try {
      const response = await updateSubscriptionPlanAction(values);
      if (response.success) {
        toast.success(response.message ?? "Subscription plan updated");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to update subscription plan");
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof UpdateSubscriptionPlanSchemaType, {
                message: errors[0],
              });
            }
          });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription plan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon-sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg")}>
        <DialogTitle>Edit subscription plan</DialogTitle>
        <DialogDescription>
          Update the details for the &ldquo;{plan.name}&rdquo; plan.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Plan details</FieldLegend>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor={`edit-plan-name-${plan.id}`}>
                      Plan name
                    </FieldLabel>
                    <Input
                      id={`edit-plan-name-${plan.id}`}
                      placeholder="Pro"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor={`edit-plan-description-${plan.id}`}>
                      Description{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <Textarea
                      id={`edit-plan-description-${plan.id}`}
                      placeholder="For growing hostels with up to 50 students."
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="price"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={!!fieldState.error}
                  >
                    <FieldLabel htmlFor={`edit-plan-price-${plan.id}`}>
                      Price (Rs.)
                    </FieldLabel>
                    <Input
                      id={`edit-plan-price-${plan.id}`}
                      inputMode="decimal"
                      placeholder="2499.00"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Monthly price in NPR, e.g. 999.00.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="maxStudents"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor={`edit-plan-max-students-${plan.id}`}>
                      Max students
                    </FieldLabel>
                    <Input
                      id={`edit-plan-max-students-${plan.id}`}
                      inputMode="numeric"
                      placeholder="50"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Leave empty for unlimited.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="maxStaff"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor={`edit-plan-max-staff-${plan.id}`}>
                      Max staff
                    </FieldLabel>
                    <Input
                      id={`edit-plan-max-staff-${plan.id}`}
                      inputMode="numeric"
                      placeholder="30"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Leave empty for unlimited.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            className="w-30"
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
