import {
  ExpenseCategory,
  ExpensePaymentMethod,
} from "@/db/schema/expenses-schema";
import z from "zod";
import type { ExpenseWithItems } from "@/types/expenses-types";

const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Amount must be a valid number with up to 2 decimal places",
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0");

const quantitySchema = z
  .string()
  .min(1, "Quantity is required")
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Quantity must be a valid number with up to 2 decimal places",
  )
  .refine((value) => Number(value) > 0, "Quantity must be greater than 0");

export const expenseCategory = z.enum(ExpenseCategory.enumValues, {
  message: "Category is required",
});
export const expensePaymentMethod = z.enum(ExpensePaymentMethod.enumValues, {
  message: "Payment method is required",
});

export const BILL_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const BILL_PHOTO_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  ".jpg",
  ".jpeg",
  ".png",
];
export const billPhotoSchema = z
  .file({ message: "Bill photo must be a file" })
  .max(BILL_PHOTO_MAX_SIZE_BYTES, "Image must be 5MB or less")
  .mime(
    ["image/jpeg", "image/png", "image/jpg"],
    "Only JPG, JPEG, and PNG images are allowed",
  )
  .optional();

export const expenseItemSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(255, "Item name must be less than 255 characters"),
  quantity: quantitySchema,
  unitPrice: amountSchema,
  amount: amountSchema.optional(),
});

export const createExpenseSchema = z.object({
  expenseDate: z.date("Date is required"),
  category: expenseCategory,
  billNumber: z
    .string()
    .trim()

    .max(100, "Bill number must be less than 255 characters")
    .optional(),
  billPhoto: billPhotoSchema,
  paymentMethod: expensePaymentMethod,
  paidTo: z
    .string()
    .trim()
    .max(255, "PaidTo to must be less than 255 characters")
    .optional(),
  paidBy: z
    .string()
    .trim()
    .min(1, "Paid by is required")
    .max(255, "Paid by must be less than 255 characters"),
  remarks: z
    .string()
    .trim()
    .max(255, "Remarks must be less than 255 characters")
    .optional(),
  items: z.array(expenseItemSchema).min(1, "At least one item is required"),
});
export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>;
export type ExpenseItemSchemaType = z.infer<typeof expenseItemSchema>;

export const editExpenseSchema = createExpenseSchema.extend({
  id: z.string().min(1, "Expense id is required"),
  existingBillPhoto: z.string().nullable().optional(),
  items: z
    .array(expenseItemSchema.extend({ id: z.string().optional() }))
    .min(1, "At least one item is required"),
});
export type EditExpenseSchemaType = z.infer<typeof editExpenseSchema>;
export function toEditExpenseDefaults(
  expense: ExpenseWithItems
): EditExpenseSchemaType {
  return {
    id: expense.id,
    expenseDate: new Date(expense.expenseDate),
    category: expense.category as EditExpenseSchemaType["category"],
    billNumber: expense.billNumber ?? "",
    billPhoto: undefined,
    existingBillPhoto: expense.billPhoto ?? null,
    paymentMethod:
      expense.paymentMethod as EditExpenseSchemaType["paymentMethod"],
    paidTo: expense.paidTo ?? "",
    paidBy: expense.paidBy,
    remarks: expense.remarks ?? "",
    items: expense.items.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
  };
}
export const createExpenseDefaultValues: CreateExpenseSchemaType = {
  expenseDate: new Date(),
  category: "food",
  billNumber: "",
  paymentMethod: "cash",
  paidTo: "",
  paidBy: "",
  remarks: "",
  items: [
    {
      itemName: "",
      quantity: "",
      unitPrice: "",
      amount: undefined,
    },
  ],
};
