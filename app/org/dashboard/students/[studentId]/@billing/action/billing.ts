"use server"

import db from "@/db"
import { invoice, payment, student } from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { billRowsType } from "@/types/billing-type"
import { eq, and, inArray, desc, asc } from "drizzle-orm"
import { paymentSchema, PaymentSchemaType } from "../schema/payment-schema"
import { PlugZap } from "lucide-react"
import z from "zod"
import { format } from "date-fns"

interface GetStudentBillsParams {
  studentId: string
}

export const getStudentBills = withAuth<
  GetStudentBillsParams,
  ActionResponse<billRowsType[]>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["read"],
  },
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<billRowsType[]>> => {
  try {
    if (!organizationId)
      return {
        success: false,
        message: "Organization not found",
      }

    const { studentId } = data

    const rows = await db
      .select()
      .from(invoice)
      .where(
        and(
          eq(invoice.studentId, studentId),
          eq(invoice.organizationId, organizationId),
          inArray(invoice.status, ["unpaid", "partial"])
        )
      )
      .orderBy(desc(invoice.periodYear), desc(invoice.periodMonth))
    const today = format(new Date(),'yyyy-MM-dd')

    const billRows = rows.map((row) => ({
      ...row,
      isOverDue: row.dueDate < today,
    }))

    return {
      success: true,
      data: billRows,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "Failed to get student bills",
    }
  }
})

function money(n: number) {
  return n.toFixed(2)
}

interface CollectPaymentData {
  applied: {
    invoiceId: string
    periodYear: number
    periodMonth: number
    amount: number
  }[]
}

export const collectPaymentAction = withAuth<
  PaymentSchemaType,
  ActionResponse<CollectPaymentData>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["collectpayment"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
}): Promise<ActionResponse<CollectPaymentData>> => {
  try {
    if (!organizationId)
      return { success: false, message: "Organization not found" }

    const parsedData = paymentSchema.safeParse(data)
    if (!parsedData.success) {
      const { fieldErrors } = z.flattenError(parsedData.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors,
      }
    }

    const { studentId, amount, method, reference, recievedBy, notes } =
      parsedData.data
    const receivedAmount = Number(amount)
    if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: {
          amount: ["Amount must be greater than 0"],
        },
      }
    }
    const [studentExists] = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.organizationId, organizationId),
          eq(student.id, studentId)
        )
      )
      .limit(1)

    if (!studentExists) {
      return {
        success: false,
        message: "Student not found",
      }
    }

    const applied = await db.transaction(async (tx) => {
      //fetching invoices
      const invoices = await tx
        .select()
        .from(invoice)
        .where(
          and(
            eq(invoice.studentId, studentId),
            eq(invoice.organizationId, organizationId),
            inArray(invoice.status, ["unpaid", "partial"])
          )
        )
        .orderBy(asc(invoice.periodYear), asc(invoice.periodMonth))

      const outstandingBalance = invoices.reduce(
        (sum, inovice) => sum + Number(inovice.dueAmount),
        0
      )

      if (invoices.length === 0) {
        throw new Error("No Outstanding Invoices found")
      }

      if (receivedAmount > outstandingBalance) {
        throw new Error("Amount is greater than outstanding balance")
      }

      const paidAt = new Date()
      const paidDate = format(paidAt, "yyyy-MM-dd")
      let remainingAmount = receivedAmount
      const splits: {
        invoiceId: string
        periodYear: number
        periodMonth: number
        amount: number
      }[] = []

      for (const inv of invoices) {
        if (remainingAmount <= 0) break //recieved amount is fully applied
        const total = Number(inv.total)
        const due = Number(inv.dueAmount)

        if (due <= 0) continue //invoice is fully paid

        const applyAmount = Math.min(remainingAmount, due)
        if (applyAmount <= 0) continue //apply amount is less 0
        const newPaid = Number(inv.paidAmount) + applyAmount
        const paidAmountStr = money(newPaid)
        const dueAmountStr = money(total - Number(paidAmountStr))

        await tx.insert(payment).values({
          invoiceId: inv.id,
          organizationId: organizationId,
          studentId: studentExists.id,
          amount: money(applyAmount),
          method: method,
          reference: reference || "",
          notes: notes || "",
          receivedBy: recievedBy || "",
          collectedBy: session.user?.id || null,
          isLate: paidDate > inv.dueDate,
          paidAt: paidAt,
        })

        await tx
          .update(invoice)
          .set({
            paidAmount: paidAmountStr,
            dueAmount: dueAmountStr,
            status: Number(dueAmountStr) <= 0 ? "paid" : "partial",
          })
          .where(eq(invoice.id, inv.id))
        splits.push({
          invoiceId: inv.id,
          periodYear: inv.periodYear,
          periodMonth: inv.periodMonth,
          amount: applyAmount,
        })
        remainingAmount -= applyAmount
      }
      return splits
    })

    return {
      success: true,
      message: "Payment Recorded Successfully",
      data: { applied },
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Something went wrong"}`,
    }
  }
})
