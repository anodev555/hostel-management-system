"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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

import { createSubscriptionPlanAction } from "../actions/create-subscriptions";
import {
  createSubscriptionPlanDefaultValues,
  createSubscriptionPlanSchema,
  type CreateSubscriptionPlanSchemaType,
} from "../schema/subscription-schema";

export default function SubscriptionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateSubscriptionPlanSchemaType>({
    resolver: zodResolver(createSubscriptionPlanSchema),
    defaultValues: createSubscriptionPlanDefaultValues,
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset(createSubscriptionPlanDefaultValues);
    }
  }

  async function onSubmit(values: CreateSubscriptionPlanSchemaType) {
    setIsLoading(true);
    try {
      const response = await createSubscriptionPlanAction(values);
      if (response.success) {
        toast.success(response.message ?? "Subscription plan created");
        setOpen(false);
        form.reset(createSubscriptionPlanDefaultValues);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to create subscription plan");
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof CreateSubscriptionPlanSchemaType, {
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
          : "Failed to create subscription plan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New plan
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg")}>
        <DialogTitle>Create subscription plan</DialogTitle>
        <DialogDescription>
          Add a new hostel subscription plan.
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
                    <FieldLabel htmlFor="plan-name">Plan name</FieldLabel>
                    <Input
                      id="plan-name"
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
                    <FieldLabel htmlFor="plan-description">
                      Description{" "}
                      <span className="ml-2 text-xs text-muted-foreground">
                        optional
                      </span>
                    </FieldLabel>
                    <Textarea
                      id="plan-description"
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
                    <FieldLabel htmlFor="plan-price">Price (Rs.)</FieldLabel>
                    <Input
                      id="plan-price"
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
                    <FieldLabel htmlFor="plan-max-students">
                      Max students
                    </FieldLabel>
                    <Input
                      id="plan-max-students"
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
                    <FieldLabel htmlFor="plan-max-staff">Max staff</FieldLabel>
                    <Input
                      id="plan-max-staff"
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
            onClick={() => form.reset(createSubscriptionPlanDefaultValues)}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="w-30"
            disabled={isLoading}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
