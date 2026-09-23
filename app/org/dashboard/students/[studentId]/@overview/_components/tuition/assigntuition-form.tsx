"use client"

import { ActiveTuitionPlanOption } from "@/types/tuition-types"
import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import {
  studentTuitionDefaultValues,
  studentTuitionSchema,
  StudentTuitionSchemaType,
} from "../../schema/student-roomfoodtuition"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { assignTuitionAction } from "../../action/tuition/student-tuition"
import { toast } from "sonner"
import { Divide } from "lucide-react"

type AssignTuitionFormProps = {
  studentId: string
  tuitionPlans: ActiveTuitionPlanOption[]
  onAssign: () => void
}

export default function AssignTuitionForm({
  studentId,
  tuitionPlans,
  onAssign,
}: AssignTuitionFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const form = useForm<StudentTuitionSchemaType>({
    resolver: zodResolver(studentTuitionSchema),
    defaultValues: { ...studentTuitionDefaultValues, studentId },
  })

  const { watch } = form
  const selectedTuitionPlanId = watch("tuitionPlanId")

  const selectedTuitionPlan = useMemo(
    () => tuitionPlans.find((plan) => plan.id === selectedTuitionPlanId),
    [tuitionPlans, selectedTuitionPlanId]
  )

  async function onSubmit(data: StudentTuitionSchemaType) {
    if (isPending) return
    startTransition(async () => {
      try {
        const response = await assignTuitionAction({
          ...data,
          studentId,
        })
        if (response.success) {
          toast.success(response.message)
          form.reset({ ...studentTuitionDefaultValues, studentId })
          router.refresh()
          onAssign?.()
        } else {
          toast.error(response.message)
          if (response.fieldErrors) {
            Object.entries(response.fieldErrors).forEach(([field, error]) => {
              if (error?.length > 0) {
                form.setError(field as keyof StudentTuitionSchemaType, {
                  message: error[0],
                })
              }
            })
          }
        }
      } catch (error) {
        toast.error(
          `${error instanceof Error ? error.message : "Something went wrong"}`
        )
      }
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tuition</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet className="w-full">
            <FieldGroup>
              <Controller
                control={form.control}
                name="tuitionPlanId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Tuition Plan</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select a tuition plan" />
                      </SelectTrigger>
                      <SelectContent className="p-2">
                        {tuitionPlans.map((tuitionPlan) => (
                          <SelectItem
                            key={tuitionPlan.id}
                            value={tuitionPlan.id}
                          >
                            {tuitionPlan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-row gap-2 text-sm text-muted-foreground">
                      {selectedTuitionPlan?.teacherName ? (
                        <div>
                          Teacher: {`${selectedTuitionPlan.teacherName}`}
                        </div>
                      ) : null}
                      {selectedTuitionPlan?.monthlyPrice ? (
                        <div>
                          Amount: Rs.{selectedTuitionPlan.monthlyPrice}/mo
                        </div>
                      ) : null}
                      {selectedTuitionPlan?.teacherSubject ? (
                        <div>
                          Subject: {`${selectedTuitionPlan.teacherSubject}`}
                        </div>
                      ) : null}
                    </div>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
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
            onClick={() => form.reset()}
            type="button"
            variant="outline"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}

            type="button"
            variant="default"
            disabled={isPending}
          >
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
