import z from "zod";

export const updatePlanStatusSchema = z.object({
  planId: z.uuid("Invalid plan id"),
  isActive: z.boolean(),
});

export type UpdatePlanStatusSchemaType = z.infer<typeof updatePlanStatusSchema>;

const priceSchema = z
  .string()
  .trim()
  .min(1, "Price is required")
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Price must be a valid number with up to 2 decimal places",
  )
  .refine((value) => Number(value) >= 0, "Price must be 0 or greater");

const optionalCapSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      return /^\d+$/.test(value) && Number(value) >= 1;
    },
    {
      message:
        "Must be a whole number of 1 or more, or left empty for unlimited",
    },
  );

export const createSubscriptionPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(100, "Plan name must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  price: priceSchema,
  maxStudents: optionalCapSchema,
  maxStaff: optionalCapSchema,
});

export type CreateSubscriptionPlanSchemaType = z.infer<
  typeof createSubscriptionPlanSchema
>;

export const createSubscriptionPlanDefaultValues: CreateSubscriptionPlanSchemaType =
  {
    name: "",
    description: "",
    price: "",
    maxStudents: "",
    maxStaff: "",
  };

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.extend(
  {
    planId: z.uuid("Invalid plan id"),
  },
);

export type UpdateSubscriptionPlanSchemaType = z.infer<
  typeof updateSubscriptionPlanSchema
>;

export const deleteSubscriptionPlanSchema = z.object({
  planId: z.uuid("Invalid plan id"),
});

export type DeleteSubscriptionPlanSchemaType = z.infer<
  typeof deleteSubscriptionPlanSchema
>;
