"use server"
import { z } from "zod"
import { withAuth } from "@/lib/withAuth"
import { organization } from "better-auth/plugins"

import {
  createExpenseSchema,
  CreateExpenseSchemaType,
} from "../schema/expenseSchema"
import db from "@/db"
import { format } from "date-fns"
import { expenseItems, expenses } from "@/db/schema"
import { uploadImage, UploadValidationError } from "@/utils/upload-file"
import { deleteFile } from "@/utils/delete-file"
import { and, eq, gte, lte, desc, sql, count, inArray } from "drizzle-orm"
import { ExpenseDashboardData, ExpenseWithItems } from "@/types/expenses-types"
import { revalidatePath } from "next/cache"
import { parsePage, parsePerPage } from "../../lib/utils"
import { ActionResponse } from "@/types/action-response"
export const createExpensesAction = withAuth<
  CreateExpenseSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: {
    expenses: ["create"],
  },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }) => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const parsed = createExpenseSchema.safeParse(data)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      return {
        success: false,
        message: "Invalid data",
        fieldErrors: fieldErrors,
      }
    }

    const { items, ...rest } = parsed.data

    const normalizedItems = items.map((item) => ({
      ...item,
      amount: (
        Math.round(Number(item.quantity) * Number(item.unitPrice) * 100) / 100
      ).toFixed(2),
    }))

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    )

    if (totalAmount <= 0) {
      throw new Error("Total amount must be greater than 0")
    }
    const expense_date = format(rest.expenseDate, "yyyy-MM-dd")

    const expense_year = rest.expenseDate.getFullYear()
    const expense_month = rest.expenseDate.getMonth() + 1
    const expense_dayofMonth = rest.expenseDate.getDate()

    let uploadedImagePath: string | null = null
    if (rest.billPhoto) {
      const { relativePath } = await uploadImage(
        rest.billPhoto,
        "public/uploads/expensesbill",
        {
          maxSizeBytes: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        }
      )
      uploadedImagePath = relativePath
    }

    const result = await db.transaction(async (tx) => {
      const [expense] = await tx
        .insert(expenses)
        .values({
          organizationId: organizationId,
          expenseDate: expense_date,
          expenseYear: expense_year,
          expenseMonth: expense_month,
          expenseDayOfMonth: expense_dayofMonth,
          category: rest.category,
          billNumber: rest.billNumber ?? null,
          billPhoto: uploadedImagePath ?? null,
          totalAmount: totalAmount.toString(),
          paymentMethod: rest.paymentMethod,
          paidTo: rest.paidTo ?? null,
          paidBy: rest.paidBy,
          remarks: rest.remarks ?? null,
          createdBy: session?.user?.id,
        })
        .returning({
          id: expenses.id,
        })

      if (!expense) {
        throw new Error("Failed to create expense")
      }
      await tx.insert(expenseItems).values(
        normalizedItems.map((item) => ({
          organizationId: organizationId,
          expenseId: expense.id,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount ?? "0.00",
        }))
      )
      return expense.id
    })

    if (!result) {
      await deleteFile(uploadedImagePath ?? "").catch((error) => {
        console.error(error)
      })
      throw new Error("Failed to create expense")
    }

    revalidatePath("/org/dashboard/expenses")

    return {
      success: true,
      message: "Expense created successfully",
      data: null,
    }
  } catch (error) {
    console.error(error)
    if (error instanceof UploadValidationError) {
      return {
        success: false,
        message: error.message,
        fieldErrors: {
          billPhoto: [error.message],
        },
      }
    }
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Something went wrong"}`,
    }
  }
})

// interface GetExpenseDashboardProps {
//   from: Date
//   to: Date
// }

export const getExpenseDashboardAction = withAuth<
  void,
  ActionResponse<ExpenseDashboardData>
>({
  roles: ["orgUser"],
  permissions: {
    expenses: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  organizationId,

}): Promise<ActionResponse<ExpenseDashboardData>> => {
  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found",
      }
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const [[totals], categoryRows, [{ expenseCount }]] = await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${expenses.totalAmount}),0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, organizationId),
            eq(expenses.expenseYear, year),
            eq(expenses.expenseMonth, month)
          )
        ),

      db
        .select({
          category: expenses.category,
          total: sql<number>`COALESCE(SUM(${expenses.totalAmount}),0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, organizationId),
            eq(expenses.expenseYear, year),
            eq(expenses.expenseMonth, month)
          )
        )
        .groupBy(expenses.category)
        .orderBy(desc(expenses.category)),

      db
        .select({
          expenseCount: count(expenses.id),
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, organizationId),
            eq(expenses.expenseYear, year),
            eq(expenses.expenseMonth, month)
          )
        ),
    ])

    return {
      success: true,
      data: {
        total: totals.total,
        date: today,
        categoryRows,
        expenseCount,
      },
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: "something went wrong",
    }
  }
})

const expenseFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  perpage: z.string().optional(),
  page: z.string().optional(),
})

type getAllExpenseProps = z.infer<typeof expenseFilterSchema>

const parseOptionalDate = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? undefined : format(date, "yyyy-MM-dd")
}

export const getAllExpenseData = withAuth<
  getAllExpenseProps,
  ActionResponse<{ expenses: ExpenseWithItems[]; totalPages: number }>
>({
  roles: ["orgUser"],
  permissions: {
    expenses: ["read"],
  },
  requireActiveOrg: true,
})(async ({ organizationId, data }): Promise<ActionResponse<{ expenses: ExpenseWithItems[]; totalPages: number }>> => {

  try {
    if (!organizationId) {
      return {
        success: false,
        message: "Organization not found! please login again",
      }
    }
    const parsedData = expenseFilterSchema.safeParse(data || {})

    if (!parsedData.success) {
      const { fieldErrors } = parsedData.error.flatten()
      return {
        success: false,
        message: "Invalid filter parameters",
        fieldErrors
      }
    }

    const { from, to, perpage, page } = parsedData.data
    const perPage = parsePerPage(perpage)
    const pageNumber = parsePage(page)
    const offset = (pageNumber - 1) * perPage


    const fromDate = parseOptionalDate(from)
    const toDate = parseOptionalDate(to)

    const filterCondition = [eq(expenses.organizationId, organizationId)]
    if (fromDate) {
      filterCondition.push(gte(expenses.expenseDate, fromDate))
    }
    if (toDate) {
      filterCondition.push(lte(expenses.expenseDate, toDate))
    }
    const monthFilter = and(...filterCondition)
    // Step 1: Get paginated expense IDs first
    const expenseIdsQuery = db.select({
      id: expenses.id
    })
      .from(expenses)
      .where(monthFilter)
      .orderBy(desc(expenses.expenseDate))
      .limit(perPage)
      .offset(offset)

    // Step 2: Get total count of unique expenses
    const countQuery = db.select({
      total: count(expenses.id)
    })
      .from(expenses)
      .where(monthFilter)

    // Step 3: Fetch full expense data with items for the paginated IDs
    const [expenseIdsResult, [{ total }]] = await Promise.all([
      expenseIdsQuery,
      countQuery
    ])

    const expenseIds = expenseIdsResult.map(row => row.id)

    // Step 4: Fetch expenses with their items using the IDs
    const expensesWithItems = await db.select({
      id: expenses.id,
      expenseDate: expenses.expenseDate,
      category: expenses.category,
      totalAmount: expenses.totalAmount,
      paymentMethod: expenses.paymentMethod,
      billNumber: expenses.billNumber,
      paidTo: expenses.paidTo,
      paidBy: expenses.paidBy,
      remarks: expenses.remarks,
      itemId: expenseItems.id,
      itemName: expenseItems.itemName,
      quantity: expenseItems.quantity,
      unitPrice: expenseItems.unitPrice,
      amount: expenseItems.amount,
    })
      .from(expenses)
      .leftJoin(expenseItems, eq(expenses.id, expenseItems.expenseId))
      .where(inArray(expenses.id, expenseIds))

    // Step 5: Group and return
    const expensesMap = new Map()
    // ... existing grouping logic
    const expensesArray = Array.isArray(expensesWithItems) ? expensesWithItems : []
    expensesArray.forEach(row => {
      if (!expensesMap.has(row.id)) {
        expensesMap.set(row.id, {
          id: row.id,
          expenseDate: row.expenseDate,
          category: row.category,
          totalAmount: row.totalAmount,
          paymentMethod: row.paymentMethod,
          billNumber: row.billNumber,
          paidTo: row.paidTo,
          paidBy: row.paidBy,
          remarks: row.remarks,
          items: []
        })
      }

      if (row.itemId) {
        expensesMap.get(row.id).items.push({
          id: row.itemId,
          itemName: row.itemName,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          amount: row.amount
        })
      }
    })

    const expensesData = Array.from(expensesMap.values())
    const totalPages = Math.ceil(total / perPage)
    console.log(expensesData)
    return {
      success: true,
      message: "Expenses retrieved successfully",
      data: {
        expenses: expensesData,
        totalPages: totalPages,

      }
    }

  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "something went wrong",
    }
  }

})