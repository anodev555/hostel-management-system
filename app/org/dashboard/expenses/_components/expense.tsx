import React from "react"
import ExpenseManagement from "./expense-management"
import { getExpenseDashboardAction, getAllExpenseData } from "../action/expenses"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Expenses({
  searchParams,
}: {
  searchParams:Promise< { from?: string; to?: string; page?: string; perpage?: string }>
}) {
  const { from, to, page, perpage } = await searchParams;
  try {
    const[dashboardResponse, expenseResponse] = await Promise.all([
       getExpenseDashboardAction(), 
       getAllExpenseData({ from , to, page:page ?? "1", perpage:perpage ?? "5" })
    ])

    if (!dashboardResponse.success || !expenseResponse.success) {
      return <ErrorPage message={dashboardResponse.message || expenseResponse.message || "Failed to load expenses"} />
    }

    return <ExpenseManagement dashboardData={dashboardResponse.data} expenseData={expenseResponse.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
