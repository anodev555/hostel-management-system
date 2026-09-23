"use server"

import db from "@/db"
import { invoice, payment, student, user } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { GetPaymentsPerStudentResponse } from "@/types/payment-type"
import { and, count, desc, eq, sum } from "drizzle-orm"
import z from "zod"
import {
  editPaymentSchema,
  EditPaymentSchemaType,
} from "../schema/editpayment-schema"
import { money } from "../../lib/utils"
import { revalidatePath } from "next/cache"

const getPaymentsPerStudentSchema = z.object({
  studentId: z.uuid("Invalid student ID"),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(20).optional(),
})

export type GetPaymentsPerStudentInput = z.infer<
  typeof getPaymentsPerStudentSchema
>

function orZero(value: string | null | undefined) {
  return value ?? "0.00"
}

export const getPaymentsPerStudent = withAuth<
  GetPaymentsPerStudentInput,
  ActionResponse<GetPaymentsPerStudentResponse>
>({
  roles: ["orgUser"],
  permissions: { payment: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetPaymentsPerStudentResponse>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" }
    }

    const parsed = getPaymentsPerStudentSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid request",
        fieldErrors,
      }
    }

    const { studentId } = parsed.data
    const page = parsed.data.page ?? 1
    const perPage = parsed.data.perPage ?? 12
    const offset = (page - 1) * perPage

    const paymentScope = and(
      eq(payment.organizationId, organizationId),
      eq(payment.studentId, studentId)
    )

    const [studentRow] = await db
      .select({
        id: student.id,
        fullName: student.fullName,
        profileImage: student.profileImage,
      })
      .from(student)
      .where(
        and(
          eq(student.id, studentId),
          eq(student.organizationId, organizationId)
        )
      )
      .limit(1)

    if (!studentRow) {
      return { success: false, message: "Student not found" }
    }

    const [[collectedRow], [{ paymentCount }], [lateRow]] = await Promise.all([
      db
        .select({ totalCollected: sum(payment.amount) })
        .from(payment)
        .where(paymentScope),

      db.select({ paymentCount: count() }).from(payment).where(paymentScope),

      db
        .select({ latePaymentCount: count() })
        .from(payment)
        .where(and(paymentScope, eq(payment.isLate, true))),
    ])

    const total = Number(paymentCount)
    const totalPages = total === 0 ? 0 : Math.ceil(total / perPage)

    if (totalPages > 0 && page > totalPages) {
      return { success: false, message: "Page out of range" }
    }

    const paymentRows = await db
      .select({
        id: payment.id,
        invoiceId: payment.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        periodYear: invoice.periodYear,
        periodMonth: invoice.periodMonth,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        notes: payment.notes,
        receivedBy: payment.receivedBy,
        collectedBy: payment.collectedBy,
        collectedByName: user.name,
        isLate: payment.isLate,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })
      .from(payment)
      .innerJoin(invoice, eq(payment.invoiceId, invoice.id))
      .leftJoin(user, eq(payment.collectedBy, user.id))
      .where(paymentScope)
      .orderBy(desc(payment.paidAt))
      .limit(perPage)
      .offset(offset)

    return {
      success: true,
      data: {
        student: studentRow,
        summary: {
          totalCollected: orZero(collectedRow?.totalCollected),
          paymentCount: total,
          latePaymentCount: Number(lateRow?.latePaymentCount ?? 0),
          totalPages,
        },
        payments: paymentRows,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Something went wrong" }
  }
})

export const updatePaymentAction = withAuth<
  EditPaymentSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    payment: ["update"],
  },
  requireActiveOrg: true,
})(async ({ organizationId, data,session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! Please relogin again",
      }
    }

    const parsedData = editPaymentSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors,
      }
    }

    const newAmount = Number(parsedData.data.amount)
    if (!isFinite(newAmount) || newAmount <= 0) {
      return {
        success: false,
        message: "Amount must be a positive number",
        fieldErrors: {
          amount: ["Amount must be a positive number"],
        },
      }
    }

    await db.transaction(async (tx) => {
      //select invoices

      const [invoiceRow] = await tx
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.id, parsedData.data.invoiceId),
            eq(invoice.studentId, parsedData.data.studentId)
          )
        ).limit(1)
      if (!invoiceRow) {
        throw new Error("Invoice not Found!")
      }

      //select
      const [paymentRow] = await tx
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.organizationId, organizationId),
            eq(payment.invoiceId, invoiceRow.id),
            eq(payment.id, parsedData.data.paymentId),
            eq(payment.studentId, parsedData.data.studentId)
          )
        ).limit(1)

      if (!paymentRow) {
        throw new Error("Payment not Found!")
      }

      const newPaidAmount =
        Number(invoiceRow.paidAmount) - Number(paymentRow.amount) + newAmount
      if (newPaidAmount < 0) {
        throw new Error("Payment amount cannot be negative")
      }
      if (newPaidAmount > Number(invoiceRow.total)) {
        throw new Error("Payment amount cannot be greater than invoice amount")
      }

      const newDue = Number(invoiceRow.total) - newPaidAmount
      const status = newPaidAmount <= 0 ? "unpaid" : newDue <= 0 ? "paid" : "partial"

      await tx
        .update(payment)
        .set({
          amount: money(newAmount),
          method: parsedData.data.method,
          reference: parsedData.data.reference,
          receivedBy: parsedData.data.recievedBy || null,
          notes: parsedData.data.notes || null,
          updatedBy:session?.user.id
        })
        .where(
          and(
            eq(payment.organizationId, organizationId),
            eq(payment.id, paymentRow.id),
            eq(payment.invoiceId, paymentRow.invoiceId),
            eq(payment.studentId, parsedData.data.studentId)
          )
        )

      await tx
        .update(invoice)
        .set({
          paidAmount: money(newPaidAmount),
          dueAmount: money(newDue),
          status: status,
        })
        .where(
          and(
            eq(invoice.organizationId, organizationId),
            eq(invoice.id, parsedData.data.invoiceId),
            eq(invoice.studentId, parsedData.data.studentId)
          )
        )
    })

    revalidatePath(
      `/org/dashboard/payments?studentId=${parsedData.data.studentId}`
    )
    revalidatePath(`/org/dashboard/students/${parsedData.data.studentId}`)
    return {
      success: true,
      message: "Payment Updated Successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
})
