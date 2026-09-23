"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActiveFoodPlanOption } from "@/types/food-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  foodPlanDefaultValues,
  foodPlanSchema,
  FoodPlanSchemaType,
} from "../../schema/student-roomfoodtuition"
import { useTransition } from "react"
import { assignFoodPlanAction } from "../../action/food/assign-foodplan"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AssignFoodPlanForm({
  studentId,
  foodPlans,
  onAssign,
}: {
  studentId: string
  foodPlans: ActiveFoodPlanOption[]
  onAssign: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const form = useForm<FoodPlanSchemaType>({
    resolver: zodResolver(foodPlanSchema),
    defaultValues: {
      foodPlanId: "",
      studentId,
    },
  })

  async function onSubmit(data: FoodPlanSchemaType) {
    startTransition(async () => {
      if (isPending) return
      try {
        const response = await assignFoodPlanAction({
          ...data,
          studentId,
        })
        if (response.success) {
          toast.success(response.message)
          form.reset({ ...foodPlanDefaultValues, studentId })
          router.refresh()
          onAssign?.()
        } else {
          toast.error(response.message)
          if (response.fieldErrors) {
            Object.entries(response.fieldErrors).forEach(([field, errors]) => {
              if (errors.length > 0) {
                form.setError(field as keyof FoodPlanSchemaType, {
                  message: errors[0],
                })
              }
            })
          }
        }
      } catch (error) {
        console.error(error)
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      }
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Food Plan</CardTitle>
        <CardDescription>Assign a food plan to the student.</CardDescription>
      </CardHeader>
      <CardContent className="">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Food Plan</FieldLegend>
            <FieldGroup>
              <Controller
                control={form.control}
                name="foodPlanId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.invalid}>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a food plan" />
                      </SelectTrigger>
                      <SelectContent className="p-2">
                        {foodPlans.map((foodPlan) => (
                          <SelectItem key={foodPlan.id} value={foodPlan.id}>
                            {foodPlan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => form.reset({ ...foodPlanDefaultValues, studentId })}
            type="button"
            variant="outline"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit, (errors) =>
              console.log("validation errors", errors)
            )}
            type="button"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Assign"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
