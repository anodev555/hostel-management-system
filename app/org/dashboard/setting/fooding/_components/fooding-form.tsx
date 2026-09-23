"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { createFoodingAction } from "../action/fooding"
import {
  createFoodingDefaultValues,
  createFoodingSchema,
  type CreateFoodingSchemaType,
} from "../schema/create-fooding"

export default function FoodingForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateFoodingSchemaType>({
    resolver: zodResolver(createFoodingSchema),
    defaultValues: createFoodingDefaultValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(createFoodingDefaultValues)
    }
  }

  async function onSubmit(values: CreateFoodingSchemaType) {
    setIsLoading(true)
    try {
      const response = await createFoodingAction(values)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(createFoodingDefaultValues)
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof CreateFoodingSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create food plan"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add Food Plan
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-lg")}>
        <DialogTitle>Add Food Plan</DialogTitle>
        <DialogDescription>
          Create a food plan with a monthly price. Assign it to students from
          their profile.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup className="grid gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="fooding-name">Plan name</FieldLabel>
                    <Input
                      id="fooding-name"
                      placeholder="Standard Meals"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      A short label for this food plan (e.g. Veg, Non-Veg,
                      Premium).
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="monthlyPrice"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="fooding-monthly-price">
                      Monthly price
                    </FieldLabel>
                    <Input
                      id="fooding-monthly-price"
                      inputMode="decimal"
                      placeholder="5000.00"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Default monthly food charge for students on this plan.
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
            type="reset"
            variant="outline"
            disabled={isLoading}
            onClick={() => form.reset(createFoodingDefaultValues)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create food plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
