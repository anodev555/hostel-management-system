// "use client"

// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableCell,
//   TableBody,
//   TableFooter,
// } from "@/components/ui/table"
// import { GetAllExpenseResponse } from "@/types/expenses-types"
// import { PaginationControls } from "@/components/pagination-controls"
// export default function ExpenseTable({
//   expenseData,
// }: {
//   expenseData: GetAllExpenseResponse
// }) {

//     const { expenses, totalPages } = expenseData;
    
//   return (
//     <div className="w-full overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Date</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Payment Method</TableHead>
//             <TableHead>Paid By</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//         {
//             expenses.length > 0 ? (
//                 expenses.map((expense) => (
//                     <TableRow key={expense.id}>
//                         <TableCell>{expense.expenseDate}</TableCell>
//                         <TableCell>{expense.category}</TableCell>
//                         <TableCell>{expense.totalAmount}</TableCell>
//                         <TableCell>{expense.paymentMethod}</TableCell>
//                         <TableCell>{expense.paidBy}</TableCell>
//                         <TableCell> 
//                             <button className="btn btn-sm btn-primary">Edit</button>
//                         </TableCell>
//                     </TableRow>
//                 ))
//             ) : (
//                 <TableRow>
//                     <TableCell colSpan={6} className="text-center">
//                         No expenses found
//                     </TableCell>
//                 </TableRow>
//             )

//         }
            
//           </TableBody>
        
//         <TableFooter>
//           <TableRow></TableRow>
//         </TableFooter>
//       </Table>
//       <PaginationControls totalPages={totalPages} />
//     </div>
//   )
// }
