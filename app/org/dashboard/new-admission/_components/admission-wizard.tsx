"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActiveFoodPlanOption } from "@/types/food-types"
import { ActiveTuitionPlanOption } from "@/types/tuition-types"
import { AvailableRoomOption } from "@/types/room-type"

import { createStudentAction } from "../action/student"
import {
  createAdmissionDefaultValues,
  createAdmissionSchema,
  type AdmissionFormType,
} from "../schema/admission-schema"
import { studentFoodAndRoomFieldKeys } from "../schema/student-foodandroom"
import { studentProfileFieldKeys } from "../schema/student-profile"
import { studentTuitionFieldKeys } from "../schema/student-tuition"
import StudentFoodAndRoom from "./student-foodandroom"
import StudentProfile from "./student-profile"
import StudentTuition from "./student-tuition"
import StudentAddress from "./student-address"
import StudentParentDetail from "./student-parentdetail"
import { studentAddressFieldKeys } from "../schema/student-address"
import { studentParentDetailsFieldKeys } from "../schema/student-parentdetails"

const STEPS = [
  { label: "Profile" },
  { label: "Address" },
  { label: "Parent Details" },
  { label: "Room & Food" },
  { label: "Tuition" },
] as const

const LAST_STEP = STEPS.length - 1

export default function AdmissionWizard({
  foodPlans,
  availableRooms,
  tuitionPlans,
}: {
  foodPlans: ActiveFoodPlanOption[]
  availableRooms: AvailableRoomOption[]
  tuitionPlans: ActiveTuitionPlanOption[]
}) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AdmissionFormType>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: createAdmissionDefaultValues,
  })

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger(studentProfileFieldKeys)
      if (!valid) return
    }

    if (step === 1) {
      const valid = await form.trigger(studentAddressFieldKeys)
      if (!valid) return
    }

    if (step === 2) {
      const valid = await form.trigger(studentParentDetailsFieldKeys)
      if (!valid) return
    }

    if (step === 3) {
      const valid = await form.trigger(studentFoodAndRoomFieldKeys)
      if (!valid) return
    }

    if (step === 4) {
      const valid = await form.trigger(studentTuitionFieldKeys)
      if (!valid) return
    }

    setStep((current) => Math.min(current + 1, LAST_STEP))
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 0))
  }

  function resolveErrorStep(fieldErrors: Record<string, string[]>) {
    const errorFields = Object.keys(fieldErrors)
    const addressStepFields = new Set<string>(studentAddressFieldKeys)
    const parentDetailsStepFields = new Set<string>(
      studentParentDetailsFieldKeys
    )
    const profileStepFields = new Set<string>(studentProfileFieldKeys)
    const roomFoodStepFields = new Set<string>(studentFoodAndRoomFieldKeys)
    const tuitionStepFields = new Set<string>(studentTuitionFieldKeys)
    if (errorFields.some((field) => profileStepFields.has(field))) {
      return 0
    }

    if (errorFields.some((field) => addressStepFields.has(field))) {
      return 1
    }
    if (errorFields.some((field) => parentDetailsStepFields.has(field))) {
      return 2
    }
    if (errorFields.some((field) => roomFoodStepFields.has(field))) {
      return 3
    }
    if (errorFields.some((field) => tuitionStepFields.has(field))) {
      return 4
    }

    return LAST_STEP
  }

  async function onSubmit(values: AdmissionFormType) {
    setIsSubmitting(true)
    try {
      const response = await createStudentAction(values)

      if (response.success) {
        toast.success(response.message ?? "Student admitted successfully")
        form.reset(createAdmissionDefaultValues)
        setStep(0)
        return
      }

      toast.error(response.message)

      if (response.fieldErrors) {
        for (const [field, errors] of Object.entries(response.fieldErrors)) {
          form.setError(field as keyof AdmissionFormType, {
            message: errors.join(", "),
          })
        }

        setStep(resolveErrorStep(response.fieldErrors))
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit admission"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>New admission</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && <StudentProfile />}
          {step === 1 && <StudentAddress />}
          {step === 2 && <StudentParentDetail />}
          {step === 3 && (
            <StudentFoodAndRoom
              foodPlans={foodPlans}
              availableRooms={availableRooms}
            />
          )}
          {step === 4 && <StudentTuition tuitionPlans={tuitionPlans} />}
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || isSubmitting}
            onClick={handleBack}
          >
            Back
          </Button>

          {step < LAST_STEP ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit admission"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </FormProvider>
  )
}
