import { z } from "zod"
import { paymentSchema } from "../../students/[studentId]/@billing/schema/payment-schema"

export const editPaymentSchema = paymentSchema.extend({
    paymentId: z.string().min(1,"Payment ID is required").trim(),
    invoiceId: z.string().min(1, "Invoice ID is required").trim(),
})

export type EditPaymentSchemaType = z.infer<typeof editPaymentSchema>