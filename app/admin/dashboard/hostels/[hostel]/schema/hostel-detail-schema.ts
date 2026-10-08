import z from "zod";

export const getHostelDetailSchema = z.object({
  hostelId: z.string().min(1, "Hostel ID is required"),
});

export type GetHostelDetailSchemaType = z.infer<typeof getHostelDetailSchema>;

export const assignSubscriptionSchema = z.object({
  hostelId: z.string().min(1, "Hostel ID is required"),
  planId: z.string().uuid("Invalid plan ID"),
});

export type AssignSubscriptionSchemaType = z.infer<typeof assignSubscriptionSchema>;

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
});

export type CancelSubscriptionSchemaType = z.infer<typeof cancelSubscriptionSchema>;

export const deleteHostelSchema = z.object({
  hostelId: z.string().min(1, "Hostel ID is required"),
  confirmation: z.literal("delete-hostel", {
    message: 'Type "delete-hostel" to confirm',
  }),
});

export type DeleteHostelSchemaType = z.infer<typeof deleteHostelSchema>;