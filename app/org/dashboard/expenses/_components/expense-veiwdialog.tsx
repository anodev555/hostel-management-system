"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseWithItems } from "@/types/expenses-types";
import { EyeIcon } from "lucide-react";
import { useState } from "react";

export default function ViewExpenseDialog({
  expense,
}: {
  expense: ExpenseWithItems;
}) {
  const [open, setOpen] = useState(false);
  const { items } = expense;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon-sm">
          <EyeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle>Expenses Items</DialogTitle>
          <DialogDescription>Expenses</DialogDescription>
        </DialogHeader>

        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="">Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unitPrice}</TableCell>
                <TableCell>{item.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
