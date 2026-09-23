export type ExpenseDashboardData = {
  total: number
  date: Date
  categoryRows: {
    category: string
    total: number
  }[]
  expenseCount: number
}


 export type ExpenseItem = {
  id: string
  itemName: string
  quantity: string
  unitPrice: string
  amount: string
}

export type ExpenseWithItems = {
  id: string
  expenseDate: string
  category: string
  totalAmount: string
  paymentMethod: string
  billNumber: string | null
  paidTo: string | null
  paidBy: string
  remarks: string | null
  items: ExpenseItem[]
}

export type GetAllExpenseResponse = {
  expenses: ExpenseWithItems[]
  totalPages: number
}