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

import { createLodgingAction } from "../action/lodging"
import {
  createLodgingDefaultValues,
  createLodgingSchema,
  type CreateLodgingSchemaType,
} from "../schema/lodging-schema"

export default function LodgingForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateLodgingSchemaType>({
    resolver: zodResolver(createLodgingSchema),
    defaultValues: createLodgingDefaultValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset(createLodgingDefaultValues)
    }
  }

  async function onSubmit(values: CreateLodgingSchemaType) {
    setIsLoading(true)
    try {
      const response = await createLodgingAction(values)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        form.reset(createLodgingDefaultValues)
      } else {
        toast.error(response.message)
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([name, errors]) => {
            if (errors.length > 0) {
              form.setError(name as keyof CreateLodgingSchemaType, {
                message: errors[0],
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create lodging plan"
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
          Add Lodging
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-lg")}>
        <DialogTitle>Add Lodging Plan</DialogTitle>
        <DialogDescription>
          Create a lodging plan with a monthly price. Assign it to rooms from
          the Rooms settings.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup className="grid gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel htmlFor="lodging-name">Plan name</FieldLabel>
                    <Input
                      id="lodging-name"
                      placeholder="AC Double"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      A short label for this lodging type (e.g. Standard, AC
                      Single).
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
                    <FieldLabel htmlFor="lodging-monthly-price">
                      Monthly price
                    </FieldLabel>
                    <Input
                      id="lodging-monthly-price"
                      inputMode="decimal"
                      placeholder="8000.00"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                    <FieldDescription>
                      Default monthly lodging charge for rooms on this plan.
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
            onClick={() => form.reset(createLodgingDefaultValues)}
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
              "Create lodging plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
