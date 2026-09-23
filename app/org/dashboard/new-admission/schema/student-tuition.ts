import z from "zod"

export const studentTuitionSchema = z
  .object({
    wantsTuition: z.boolean(),
    tuitionPlanId: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (!data.wantsTuition) return

    const result = z.uuid("Select a tuition plan").safeParse(data.tuitionPlanId)
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: "Select a tuition plan",
        path: ["tuitionPlanId"],
      })
    }
  })

export type StudentTuitionSchemaType = z.infer<typeof studentTuitionSchema>

export const studentTuitionDefaultValues: StudentTuitionSchemaType = {
  wantsTuition: false,
  tuitionPlanId: "",
}

export const studentTuitionFieldKeys = Object.keys(
  studentTuitionDefaultValues
) as (keyof StudentTuitionSchemaType)[]

// export const studentTuitionSchema = z.discriminatedUnion("wantsTuition", [
//   z.object({
//     wantsTuition: z.literal(false),
//     tuitionPlanId: z.string().optional(),
//   }),
//   z.object({
//     wantsTuition: z.literal(true),
//     tuitionPlanId: z.uuid("Select a tuition plan"),
//   }),
// ])

// export type StudentTuitionSchemaType = z.infer<typeof studentTuitionSchema>

// export type StudentTuitionFormFields = {
//   wantsTuition: boolean
//   tuitionPlanId: string
// }

// export const studentTuitionDefaultValues: StudentTuitionFormFields = {
//   wantsTuition: false,
//   tuitionPlanId: "",
// }

// export const studentTuitionFieldKeys = Object.keys(
//   studentTuitionDefaultValues
// ) as (keyof StudentTuitionFormFields)[]
