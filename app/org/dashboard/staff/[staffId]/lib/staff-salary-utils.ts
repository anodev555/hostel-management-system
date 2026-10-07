import type { StaffDetail, StaffSalaryContract } from "@/types/staff-type";

import type { StaffSalarySchemaType } from "../schema/staffSalary";

export function normalizeSalaryAmount(
  value: string | null | undefined,
): string {
  if (!value) return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return amount % 1 === 0 ? String(Math.trunc(amount)) : amount.toFixed(2);
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function staffToSalaryFormValues(
  staffDetail: StaffDetail,
): StaffSalarySchemaType {
  return {
    staffId: staffDetail.staffId,
    monthlyAmount: normalizeSalaryAmount(staffDetail.salary),
  };
}

export function formatContractDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseDateOnly(value) : value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function mapSalaryContract(row: {
  id: string;
  monthlyAmount: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): StaffSalaryContract {
  return {
    id: row.id,
    monthlyAmount: row.monthlyAmount,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    status: row.status === "inactive" ? "inactive" : "active",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
