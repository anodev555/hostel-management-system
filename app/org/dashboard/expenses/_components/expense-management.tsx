"use client"

import { Button } from "@/components/ui/button"
import ExpenseForm from "./expense-form"
import ExpenseFilter from "./expense-filter"

import { cn } from "@/lib/utils"
import { ExpenseDashboardStats } from "./expensedashboard-card"
import { ExpenseDashboardData } from "@/types/expenses-types"
import { GetAllExpenseResponse } from "@/types/expenses-types"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginationControls } from "@/components/pagination-controls"
import { formatPaymentMethod } from "../../lib/utils"

export default function ExpenseManagement({
  dashboardData,
  expenseData,
}: {
  dashboardData: ExpenseDashboardData
  expenseData: GetAllExpenseResponse
}) {
  const { expenses, totalPages } = expenseData

  return (
    <div className="w-full flex-col space-y-4">
      {/* header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense</h1>
          <p className="text-sm text-gray-500">
            Manage your expenses and track your spending
          </p>
        </div>
        <div>
          <ExpenseForm />
        </div>
      </div>

      <ExpenseDashboardStats dashboardData={dashboardData} />

      <ExpenseFilter />
      <div className="w-full space-y-4">
        {" "}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Paid By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expenseDate}</TableCell>
                  <TableCell className="capitalize">
                    {expense.category}
                  </TableCell>
                  <TableCell>{expense.totalAmount}</TableCell>
                  <TableCell>
                    {formatPaymentMethod(expense.paymentMethod)}
                  </TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell>
                    <button className="btn btn-sm btn-primary">Edit</button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow></TableRow>
          </TableFooter>
        </Table>
        <PaginationControls totalPages={totalPages} />
      </div>
    </div>
  )
}
