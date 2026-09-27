"use server";

import db from "@/db";
import {
  member,
  payrollContract,
  payrollDeduction,
  payrollInvoice,
  payrollInvoiceLineItem,
  payrollPayment,
  tuitionTeacher,
  user,
} from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import {
  GetPayrollInvoicesResponse,
  PayrollEmployeeDetail,
  PayrollEmployeeRow,
  PayrollInvoiceDetail,
  PayrollInvoiceRow,
} from "@/types/payroll-types";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sum,
} from "drizzle-orm";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addPayrollDeductionSchema,
  AddPayrollDeductionSchemaType,
  collectEmployeePaymentSchema,
  CollectEmployeePaymentSchemaType,
  collectPayrollPaymentSchema,
  CollectPayrollPaymentSchemaType,
  deletePayrollDeductionSchema,
  DeletePayrollDeductionSchemaType,
  deletePayrollPayoutSchema,
  DeletePayrollPayoutSchemaType,
  getPayrollEmployeeDetailSchema,
  getPayrollInvoiceDetailSchema,
  getPayrollInvoicesSchema,
  GetPayrollInvoicesSchemaType,
  updatePayrollDeductionSchema,
  UpdatePayrollDeductionSchemaType,
  updatePayrollPayoutSchema,
  UpdatePayrollPayoutSchemaType,
  voidPayrollInvoiceSchema,
  VoidPayrollInvoiceSchemaType,
} from "../schema/payroll-schema";

function money(value: number) {
  return value.toFixed(2);
}

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function decideStatus(paid: number, total: number) {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}

function toPayrollInvoiceStatus(status: string) {
  return status as PayrollInvoiceRow["status"];
}

export type AppliedPayoutSplit = {
  invoiceId: string;
  periodYear: number;
  periodMonth: number;
  amount: number;
};

// ---------------------------------------------------------------------------
// List — one row per staff/teacher with only what the table shows:
// name, type, paid/partial/unpaid status, remaining to pay, overdue flag.
// Summary totals are added up from the slips in the same loop.
// No deduction lookup: deductions only live on the detail page.
// ---------------------------------------------------------------------------

function resolveStatusCondition(status: string) {
  switch (status) {
    case "unpaid":
      return eq(payrollInvoice.status, "unpaid");
    case "partial":
      return eq(payrollInvoice.status, "partial");
    case "paid":
      return eq(payrollInvoice.status, "paid");
    case "all":
      return ne(payrollInvoice.status, "void");
    case "outstanding":
    default:
      return inArray(payrollInvoice.status, ["unpaid", "partial"]);
  }
}

export const getPayrollInvoices = withAuth<
  GetPayrollInvoicesSchemaType,
  ActionResponse<GetPayrollInvoicesResponse>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetPayrollInvoicesResponse>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = getPayrollInvoicesSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid request", fieldErrors };
    }

    const { payeeType, search } = parsed.data;
    const status = parsed.data.status ?? "outstanding";
    const page = parsed.data.page ?? 1;
    const perPage = parsed.data.perPage ?? 10;
    const today = format(new Date(), "yyyy-MM-dd");

    const searchWhere = search
      ? or(
          ilike(user.name, `%${search}%`),
          ilike(tuitionTeacher.fullName, `%${search}%`),
        )
      : undefined;

    const listWhere = and(
      eq(payrollInvoice.organizationId, organizationId),
      payeeType ? eq(payrollInvoice.payeeType, payeeType) : undefined,
      resolveStatusCondition(status),
      searchWhere,
    );

    const rows = await db
      .select({
        payeeType: payrollInvoice.payeeType,
        memberId: payrollInvoice.memberId,
        teacherId: payrollInvoice.teacherId,
        dueDate: payrollInvoice.dueDate,
        total: payrollInvoice.total,
        paidAmount: payrollInvoice.paidAmount,
        dueAmount: payrollInvoice.dueAmount,
        status: payrollInvoice.status,
        staffName: user.name,
        teacherName: tuitionTeacher.fullName,
      })
      .from(payrollInvoice)
      .leftJoin(member, eq(payrollInvoice.memberId, member.id))
      .leftJoin(user, eq(member.userId, user.id))
      .leftJoin(tuitionTeacher, eq(payrollInvoice.teacherId, tuitionTeacher.id))
      .where(listWhere);

    // Group slips by person. Summary totals come straight from the slips;
    // each person only keeps their remaining amount (+ helpers for status).
    const grouped = new Map<
      string,
      {
        payeeType: (typeof rows)[number]["payeeType"];
        payeeId: string;
        payeeName: string;
        remaining: number;
        paidSoFar: number;
        isOverDue: boolean;
      }
    >();

    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;

    for (const row of rows) {
      const isStaff = row.payeeType === "staff";
      const payeeId = (isStaff ? row.memberId : row.teacherId) ?? "";
      if (!payeeId) continue;

      const due = Number(row.dueAmount);
      const paid = Number(row.paidAmount);
      totalBilled += Number(row.total);
      totalPaid += paid;
      totalDue += due;

      const key = `${row.payeeType}:${payeeId}`;
      let entry = grouped.get(key);
      if (!entry) {
        entry = {
          payeeType: row.payeeType,
          payeeId,
          payeeName: isStaff
            ? (row.staffName ?? "Staff")
            : (row.teacherName ?? "Teacher"),
          remaining: 0,
          paidSoFar: 0,
          isOverDue: false,
        };
        grouped.set(key, entry);
      }

      entry.remaining += due;
      entry.paidSoFar += paid;
      if (row.status !== "paid" && row.dueDate < today) entry.isOverDue = true;
    }

    let employees: PayrollEmployeeRow[] = [];
    let pendingCount = 0;
    let paidEmployees = 0;
    for (const e of grouped.values()) {
      const cleared = e.remaining <= 0;
      if (cleared) paidEmployees += 1;
      else pendingCount += 1;
      employees.push({
        payeeType: e.payeeType,
        payeeId: e.payeeId,
        payeeName: e.payeeName,
        totalRemaining: money(e.remaining),
        status: cleared ? "paid" : e.paidSoFar > 0 ? "partial" : "unpaid",
        isOverDue: e.isOverDue,
      });
    }

    const totalCount = employees.length;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / perPage);
    if (totalPages > 0 && page > totalPages) {
      return { success: false, message: "Page out of range" };
    }
    const start = (page - 1) * perPage;
    employees = employees.slice(start, start + perPage);

    return {
      success: true,
      data: {
        summary: {
          totalBilled: money(totalBilled),
          totalPaid: money(totalPaid),
          totalDue: money(totalDue),
          paidCount: paidEmployees,
          pendingCount,
          totalCount,
          totalPages,
        },
        employees,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
});

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export const getPayrollInvoiceDetail = withAuth<
  { invoiceId: string },
  ActionResponse<PayrollInvoiceDetail>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<PayrollInvoiceDetail>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = getPayrollInvoiceDetailSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid request", fieldErrors };
    }

    const { invoiceId } = parsed.data;

    const [inv] = await db
      .select()
      .from(payrollInvoice)
      .where(
        and(
          eq(payrollInvoice.organizationId, organizationId),
          eq(payrollInvoice.id, invoiceId),
        ),
      )
      .limit(1);

    if (!inv) {
      return { success: false, message: "Payroll invoice not found" };
    }

    const isStaff = inv.payeeType === "staff";

    let mappedPayee:
      | {
          id: string;
          name: string;
          image: string | null;
          role: string | null;
          phone: string | null;
          email: string | null;
        }
      | undefined;

    if (isStaff) {
      const [staffRow] = await db
        .select({
          id: member.id,
          name: user.name,
          image: user.image,
          role: member.role,
          phone: user.contactPhone,
          email: user.email,
        })
        .from(member)
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(member.id, inv.memberId ?? ""))
        .limit(1);
      mappedPayee = staffRow ?? undefined;
    } else {
      const [teacherRow] = await db
        .select({
          id: tuitionTeacher.id,
          name: tuitionTeacher.fullName,
          role: tuitionTeacher.subject,
          phone: tuitionTeacher.phone,
          email: tuitionTeacher.email,
        })
        .from(tuitionTeacher)
        .where(eq(tuitionTeacher.id, inv.teacherId ?? ""))
        .limit(1);
      mappedPayee = teacherRow ? { ...teacherRow, image: null } : undefined;
    }

    const [contractRow] = await db
      .select({ monthlyAmount: payrollContract.monthlyAmount })
      .from(payrollContract)
      .where(
        and(
          eq(payrollContract.organizationId, organizationId),
          eq(payrollContract.payeeType, inv.payeeType),
          isStaff
            ? eq(payrollContract.memberId, inv.memberId ?? "")
            : eq(payrollContract.teacherId, inv.teacherId ?? ""),
          eq(payrollContract.status, "active"),
          isNull(payrollContract.effectiveTo),
        ),
      )
      .limit(1);

    const [lineItems, deductions, payouts] = await Promise.all([
      db
        .select({
          id: payrollInvoiceLineItem.id,
          description: payrollInvoiceLineItem.description,
          amount: payrollInvoiceLineItem.amount,
          chargeStartAt: payrollInvoiceLineItem.chargeStartAt,
          chargeEndAt: payrollInvoiceLineItem.chargeEndAt,
          daysCharged: payrollInvoiceLineItem.daysCharged,
          daysInMonth: payrollInvoiceLineItem.daysInMonth,
          isProrated: payrollInvoiceLineItem.isProrated,
        })
        .from(payrollInvoiceLineItem)
        .where(
          and(
            eq(payrollInvoiceLineItem.organizationId, organizationId),
            eq(payrollInvoiceLineItem.payrollInvoiceId, invoiceId),
          ),
        ),
      db
        .select({
          id: payrollDeduction.id,
          reason: payrollDeduction.reason,
          description: payrollDeduction.description,
          amount: payrollDeduction.amount,
          createdByName: user.name,
          createdAt: payrollDeduction.createdAt,
          updatedAt: payrollDeduction.updatedAt,
        })
        .from(payrollDeduction)
        .leftJoin(user, eq(payrollDeduction.createdBy, user.id))
        .where(
          and(
            eq(payrollDeduction.organizationId, organizationId),
            eq(payrollDeduction.payrollInvoiceId, invoiceId),
          ),
        )
        .orderBy(desc(payrollDeduction.createdAt)),
      db
        .select({
          id: payrollPayment.id,
          amount: payrollPayment.amount,
          method: payrollPayment.method,
          reference: payrollPayment.reference,
          notes: payrollPayment.notes,
          paidAt: payrollPayment.paidAt,
          receivedBy: payrollPayment.receivedBy,
          collectedByName: user.name,
        })
        .from(payrollPayment)
        .leftJoin(user, eq(payrollPayment.collectedBy, user.id))
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            eq(payrollPayment.payrollInvoiceId, invoiceId),
          ),
        )
        .orderBy(asc(payrollPayment.paidAt)),
    ]);

    return {
      success: true,
      data: {
        invoice: {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          payeeType: inv.payeeType,
          periodYear: inv.periodYear,
          periodMonth: inv.periodMonth,
          periodStart: inv.periodStart,
          periodEnd: inv.periodEnd,
          issuedAt: inv.issuedAt,
          dueDate: inv.dueDate,
          subTotal: inv.subTotal,
          total: inv.total,
          paidAmount: inv.paidAmount,
          dueAmount: inv.dueAmount,
          status: toPayrollInvoiceStatus(inv.status),
          notes: inv.notes,
        },
        payee: {
          id: mappedPayee?.id ?? "",
          name: mappedPayee?.name ?? (isStaff ? "Staff" : "Teacher"),
          image: mappedPayee?.image ?? null,
          role: mappedPayee?.role ?? null,
          phone: mappedPayee?.phone ?? null,
          email: mappedPayee?.email ?? null,
          activeContractAmount: contractRow?.monthlyAmount ?? null,
        },
        lineItems,
        deductions,
        payouts,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
});

// ---------------------------------------------------------------------------
// Employee detail — outstanding + completed + payout logs (no date filter)
// ---------------------------------------------------------------------------

export const getPayrollEmployeeDetail = withAuth<
  { payeeType: "staff" | "teacher"; payeeId: string },
  ActionResponse<PayrollEmployeeDetail>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["read"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<PayrollEmployeeDetail>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = getPayrollEmployeeDetailSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid request", fieldErrors };
    }

    const { payeeType, payeeId } = parsed.data;
    const isStaff = payeeType === "staff";
    const today = format(new Date(), "yyyy-MM-dd");

    let payeeInfo: PayrollEmployeeDetail["payee"] | undefined;
    if (isStaff) {
      const [staffRow] = await db
        .select({
          id: member.id,
          name: user.name,
          image: user.image,
          role: member.role,
          phone: user.contactPhone,
          email: user.email,
        })
        .from(member)
        .leftJoin(user, eq(member.userId, user.id))
        .where(
          and(
            eq(member.id, payeeId),
            eq(member.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!staffRow) {
        return { success: false, message: "Staff not found" };
      }
      const [contractRow] = await db
        .select({ monthlyAmount: payrollContract.monthlyAmount })
        .from(payrollContract)
        .where(
          and(
            eq(payrollContract.organizationId, organizationId),
            eq(payrollContract.payeeType, "staff"),
            eq(payrollContract.memberId, payeeId),
            eq(payrollContract.status, "active"),
            isNull(payrollContract.effectiveTo),
          ),
        )
        .limit(1);
      payeeInfo = {
        id: staffRow.id,
        name: staffRow.name ?? "Staff",
        image: staffRow.image ?? null,
        role: staffRow.role ?? null,
        phone: staffRow.phone ?? null,
        email: staffRow.email ?? null,
        activeContractAmount: contractRow?.monthlyAmount ?? null,
      };
    } else {
      const [teacherRow] = await db
        .select({
          id: tuitionTeacher.id,
          name: tuitionTeacher.fullName,
          role: tuitionTeacher.subject,
          phone: tuitionTeacher.phone,
          email: tuitionTeacher.email,
        })
        .from(tuitionTeacher)
        .where(
          and(
            eq(tuitionTeacher.id, payeeId),
            eq(tuitionTeacher.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!teacherRow) {
        return { success: false, message: "Teacher not found" };
      }
      const [contractRow] = await db
        .select({ monthlyAmount: payrollContract.monthlyAmount })
        .from(payrollContract)
        .where(
          and(
            eq(payrollContract.organizationId, organizationId),
            eq(payrollContract.payeeType, "teacher"),
            eq(payrollContract.teacherId, payeeId),
            eq(payrollContract.status, "active"),
            isNull(payrollContract.effectiveTo),
          ),
        )
        .limit(1);
      payeeInfo = {
        id: teacherRow.id,
        name: teacherRow.name ?? "Teacher",
        image: null,
        role: teacherRow.role ?? null,
        phone: teacherRow.phone ?? null,
        email: teacherRow.email ?? null,
        activeContractAmount: contractRow?.monthlyAmount ?? null,
      };
    }

    const payeeCondition = isStaff
      ? eq(payrollInvoice.memberId, payeeId)
      : eq(payrollInvoice.teacherId, payeeId);

    const invoices = await db
      .select()
      .from(payrollInvoice)
      .where(
        and(
          eq(payrollInvoice.organizationId, organizationId),
          eq(payrollInvoice.payeeType, payeeType),
          payeeCondition,
          ne(payrollInvoice.status, "void"),
        ),
      )
      .orderBy(
        asc(payrollInvoice.periodYear),
        asc(payrollInvoice.periodMonth),
        asc(payrollInvoice.createdAt),
      );

    const invoiceIds = invoices.map((inv) => inv.id);
    const [deductionRows, payoutCountRows, payoutRows] =
      invoiceIds.length > 0
        ? await Promise.all([
            db
              .select({
                payrollInvoiceId: payrollDeduction.payrollInvoiceId,
                total: sum(payrollDeduction.amount),
              })
              .from(payrollDeduction)
              .where(inArray(payrollDeduction.payrollInvoiceId, invoiceIds))
              .groupBy(payrollDeduction.payrollInvoiceId),
            db
              .select({
                payrollInvoiceId: payrollPayment.payrollInvoiceId,
                value: sum(payrollPayment.amount),
              })
              .from(payrollPayment)
              .where(inArray(payrollPayment.payrollInvoiceId, invoiceIds))
              .groupBy(payrollPayment.payrollInvoiceId),
            db
              .select({
                id: payrollPayment.id,
                payrollInvoiceId: payrollPayment.payrollInvoiceId,
                amount: payrollPayment.amount,
                method: payrollPayment.method,
                reference: payrollPayment.reference,
                notes: payrollPayment.notes,
                paidAt: payrollPayment.paidAt,
                receivedBy: payrollPayment.receivedBy,
                collectedByName: user.name,
              })
              .from(payrollPayment)
              .leftJoin(user, eq(payrollPayment.collectedBy, user.id))
              .where(
                and(
                  eq(payrollPayment.organizationId, organizationId),
                  inArray(payrollPayment.payrollInvoiceId, invoiceIds),
                ),
              )
              .orderBy(desc(payrollPayment.paidAt)),
          ])
        : [[], [], []];

    const deductionByInvoice = new Map(
      deductionRows.map((row) => [
        row.payrollInvoiceId,
        Number(row.total ?? 0),
      ]),
    );
    void payoutCountRows;
    const invoiceMeta = new Map(
      invoices.map((inv) => [
        inv.id,
        {
          invoiceNumber: inv.invoiceNumber,
          periodYear: inv.periodYear,
          periodMonth: inv.periodMonth,
        },
      ]),
    );

    const toRow = (inv: (typeof invoices)[number]) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      periodYear: inv.periodYear,
      periodMonth: inv.periodMonth,
      periodStart: inv.periodStart,
      periodEnd: inv.periodEnd,
      issuedAt: inv.issuedAt,
      dueDate: inv.dueDate,
      subTotal: inv.subTotal,
      deductionTotal: money(deductionByInvoice.get(inv.id) ?? 0),
      total: inv.total,
      paidAmount: inv.paidAmount,
      dueAmount: inv.dueAmount,
      status: toPayrollInvoiceStatus(inv.status),
      payoutCount: payoutRows.filter((p) => p.payrollInvoiceId === inv.id)
        .length,
      isOverDue: inv.status !== "paid" && inv.dueDate < today,
    });

    const outstanding = invoices
      .filter((inv) => inv.status === "unpaid" || inv.status === "partial")
      .map(toRow);
    const completed = invoices
      .filter((inv) => inv.status === "paid")
      .map(toRow);

    const payouts: PayrollEmployeeDetail["payouts"] = payoutRows.map((p) => ({
      id: p.id,
      amount: p.amount,
      method: p.method as PayrollEmployeeDetail["payouts"][number]["method"],
      reference: p.reference,
      notes: p.notes,
      paidAt: p.paidAt,
      receivedBy: p.receivedBy,
      collectedByName: p.collectedByName,
      invoiceId: p.payrollInvoiceId,
      invoiceNumber: invoiceMeta.get(p.payrollInvoiceId)?.invoiceNumber ?? "—",
      periodYear: invoiceMeta.get(p.payrollInvoiceId)?.periodYear ?? 0,
      periodMonth: invoiceMeta.get(p.payrollInvoiceId)?.periodMonth ?? 0,
    }));

    const sumField = (
      list: typeof outstanding,
      pick: (r: (typeof outstanding)[number]) => number,
    ) => list.reduce((s, r) => s + pick(r), 0);

    return {
      success: true,
      data: {
        payeeType,
        payee: payeeInfo,
        summary: {
          totalGross: money(sumField(outstanding, (r) => Number(r.subTotal))),
          totalDeductions: money(
            sumField(outstanding, (r) => Number(r.deductionTotal)),
          ),
          totalNet: money(sumField(outstanding, (r) => Number(r.total))),
          totalPaid: money(sumField(outstanding, (r) => Number(r.paidAmount))),
          totalRemaining: money(
            sumField(outstanding, (r) => Number(r.dueAmount)),
          ),
          outstandingCount: outstanding.length,
          paidCount: completed.length,
        },
        outstanding,
        completed,
        payouts,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
});

// ---------------------------------------------------------------------------
// Collect payment (pay salary) — FIFO across the payee's outstanding invoices
// ---------------------------------------------------------------------------

export const collectPayrollPayment = withAuth<
  CollectPayrollPaymentSchemaType,
  ActionResponse<{ applied: AppliedPayoutSplit[] }>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["create"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
}): Promise<ActionResponse<{ applied: AppliedPayoutSplit[] }>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = collectPayrollPaymentSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { invoiceId, method, reference, notes, receivedBy } = parsed.data;
    const amountNum = Number(parsed.data.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: { amount: ["Amount must be greater than 0"] },
      };
    }

    const applied = await db.transaction(async (tx) => {
      const [inv] = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, invoiceId),
          ),
        )
        .limit(1);

      if (!inv) {
        throw new Error("Payroll invoice not found");
      }

      const payeeCondition =
        inv.payeeType === "staff"
          ? eq(payrollInvoice.memberId, inv.memberId ?? "")
          : eq(payrollInvoice.teacherId, inv.teacherId ?? "");

      const invoices = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.payeeType, inv.payeeType),
            payeeCondition,
            inArray(payrollInvoice.status, ["unpaid", "partial"]),
          ),
        )
        .orderBy(
          asc(payrollInvoice.periodYear),
          asc(payrollInvoice.periodMonth),
        );

      const outstandingBalance = invoices.reduce(
        (sumAmount, invoice) => sumAmount + Number(invoice.dueAmount),
        0,
      );

      if (invoices.length === 0) {
        throw new Error("No outstanding payroll invoices found");
      }
      if (amountNum > outstandingBalance) {
        throw new Error("Amount is greater than outstanding balance");
      }

      const paidAt = new Date();
      let remainingAmount = amountNum;
      const splits: AppliedPayoutSplit[] = [];

      for (const invRow of invoices) {
        if (remainingAmount <= 0) break;
        const total = Number(invRow.total);
        const due = Number(invRow.dueAmount);
        if (due <= 0) continue;

        const applyAmount = Math.min(remainingAmount, due);
        if (applyAmount <= 0) continue;

        const newPaid = Number(invRow.paidAmount) + applyAmount;
        const paidAmountStr = money(newPaid);
        const dueAmountStr = money(total - Number(paidAmountStr));

        await tx.insert(payrollPayment).values({
          payrollInvoiceId: invRow.id,
          organizationId,
          payeeType: invRow.payeeType,
          memberId: invRow.memberId,
          teacherId: invRow.teacherId,
          amount: money(applyAmount),
          method,
          reference: reference || null,
          notes: notes || null,
          receivedBy: receivedBy || null,
          collectedBy: session?.user?.id ?? null,
          paidAt,
        });

        await tx
          .update(payrollInvoice)
          .set({
            paidAmount: paidAmountStr,
            dueAmount: dueAmountStr,
            status: Number(dueAmountStr) <= 0 ? "paid" : "partial",
            updatedBy: session?.user?.id ?? null,
          })
          .where(eq(payrollInvoice.id, invRow.id));

        splits.push({
          invoiceId: invRow.id,
          periodYear: invRow.periodYear,
          periodMonth: invRow.periodMonth,
          amount: applyAmount,
        });
        remainingAmount -= applyAmount;
      }

      return splits;
    });

    revalidatePath("/org/dashboard/payroll");
    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);

    return {
      success: true,
      message: "Salary payout recorded successfully",
      data: { applied },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

// Collect employee payment — oldest invoices are always cleared first (FIFO)

export const collectEmployeePayment = withAuth<
  CollectEmployeePaymentSchemaType,
  ActionResponse<{ applied: AppliedPayoutSplit[] }>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["create"] },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
  session,
}): Promise<ActionResponse<{ applied: AppliedPayoutSplit[] }>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = collectEmployeePaymentSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { payeeType, payeeId, method, reference, notes, receivedBy } =
      parsed.data;
    const amountNum = Number(parsed.data.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: { amount: ["Amount must be greater than 0"] },
      };
    }

    const applied = await db.transaction(async (tx) => {
      const payeeCondition =
        payeeType === "staff"
          ? eq(payrollInvoice.memberId, payeeId)
          : eq(payrollInvoice.teacherId, payeeId);

      // Oldest first: period year/month, then creation order
      const invoices = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.payeeType, payeeType),
            payeeCondition,
            inArray(payrollInvoice.status, ["unpaid", "partial"]),
          ),
        )
        .orderBy(
          asc(payrollInvoice.periodYear),
          asc(payrollInvoice.periodMonth),
          asc(payrollInvoice.createdAt),
        );

      const outstandingBalance = invoices.reduce(
        (sumAmount, invoice) => sumAmount + Number(invoice.dueAmount),
        0,
      );

      if (invoices.length === 0) {
        throw new Error("No outstanding payroll invoices found");
      }
      if (amountNum > outstandingBalance + 0.001) {
        throw new Error("Amount is greater than outstanding balance");
      }

      const paidAt = new Date();
      let remainingAmount = amountNum;
      const splits: AppliedPayoutSplit[] = [];

      for (const invRow of invoices) {
        if (remainingAmount <= 0.001) break;
        const total = Number(invRow.total);
        const due = Number(invRow.dueAmount);
        if (due <= 0) continue;

        const applyAmount = Math.min(remainingAmount, due);
        if (applyAmount <= 0) continue;

        const newPaid = Number(invRow.paidAmount) + applyAmount;
        const paidAmountStr = money(newPaid);
        const dueAmountStr = money(total - Number(paidAmountStr));

        await tx.insert(payrollPayment).values({
          payrollInvoiceId: invRow.id,
          organizationId,
          payeeType: invRow.payeeType,
          memberId: invRow.memberId,
          teacherId: invRow.teacherId,
          amount: money(applyAmount),
          method,
          reference: reference || null,
          notes: notes || null,
          receivedBy: receivedBy || null,
          collectedBy: session?.user?.id ?? null,
          paidAt,
        });

        await tx
          .update(payrollInvoice)
          .set({
            paidAmount: paidAmountStr,
            dueAmount: dueAmountStr,
            status: Number(dueAmountStr) <= 0 ? "paid" : "partial",
            updatedBy: session?.user?.id ?? null,
          })
          .where(eq(payrollInvoice.id, invRow.id));

        splits.push({
          invoiceId: invRow.id,
          periodYear: invRow.periodYear,
          periodMonth: invRow.periodMonth,
          amount: applyAmount,
        });
        remainingAmount -= applyAmount;
      }

      return splits;
    });

    revalidatePath("/org/dashboard/payroll");
    revalidatePath(`/org/dashboard/payroll/employee/${payeeType}/${payeeId}`);

    return {
      success: true,
      message:
        "Salary payout recorded successfully — oldest dues cleared first",
      data: { applied },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

// ---------------------------------------------------------------------------
// Deductions — only allowed on unpaid / partial invoices
// ---------------------------------------------------------------------------

async function recomputeInvoiceAfterDeduction(
  tx: DbTransaction,
  invoiceId: string,
  organizationId: string,
  updatedBy: string | null,
) {
  const [inv] = await tx
    .select()
    .from(payrollInvoice)
    .where(
      and(
        eq(payrollInvoice.organizationId, organizationId),
        eq(payrollInvoice.id, invoiceId),
      ),
    )
    .limit(1);

  if (!inv) {
    throw new Error("Payroll invoice not found");
  }

  const [dedTotalRow] = await tx
    .select({ total: sum(payrollDeduction.amount) })
    .from(payrollDeduction)
    .where(eq(payrollDeduction.payrollInvoiceId, invoiceId));

  const deductionTotal = Number(dedTotalRow?.total ?? 0);
  const netTotal = Number(inv.subTotal) - deductionTotal;
  const paid = Number(inv.paidAmount);

  if (netTotal < 0) {
    throw new Error("Deductions cannot exceed gross salary");
  }
  if (netTotal < paid) {
    throw new Error("Deductions exceed the already-paid amount");
  }

  const due = netTotal - paid;

  await tx
    .update(payrollInvoice)
    .set({
      total: money(netTotal),
      dueAmount: money(due),
      status: decideStatus(paid, netTotal),
      updatedBy,
    })
    .where(
      and(
        eq(payrollInvoice.organizationId, organizationId),
        eq(payrollInvoice.id, invoiceId),
      ),
    );
}

export const addPayrollDeduction = withAuth<
  AddPayrollDeductionSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["create"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = addPayrollDeductionSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { payrollInvoiceId, reason, description } = parsed.data;
    const amountNum = Number(parsed.data.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: { amount: ["Amount must be greater than 0"] },
      };
    }

    await db.transaction(async (tx) => {
      const [inv] = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, payrollInvoiceId),
            ne(payrollInvoice.status, "void"),
          ),
        )
        .limit(1);

      if (!inv) {
        throw new Error("Payroll invoice not found or voided");
      }

      if (inv.status !== "unpaid" && inv.status !== "partial") {
        throw new Error(
          "Deductions can only be added to unpaid or partial invoices",
        );
      }

      await tx.insert(payrollDeduction).values({
        payrollInvoiceId: inv.id,
        organizationId,
        payeeType: inv.payeeType,
        memberId: inv.memberId,
        teacherId: inv.teacherId,
        reason,
        description: description || null,
        amount: money(amountNum),
        createdBy: session?.user?.id ?? null,
      });

      await recomputeInvoiceAfterDeduction(
        tx,
        inv.id,
        organizationId,
        session?.user?.id ?? null,
      );
    });

    revalidatePath(`/org/dashboard/payroll/${payrollInvoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Deduction added successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

export const updatePayrollDeduction = withAuth<
  UpdatePayrollDeductionSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["update"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = updatePayrollDeductionSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { deductionId, reason, description } = parsed.data;
    const amountNum = Number(parsed.data.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: { amount: ["Amount must be greater than 0"] },
      };
    }

    const invoiceId = await db.transaction(async (tx) => {
      const [deductionRow] = await tx
        .select()
        .from(payrollDeduction)
        .where(
          and(
            eq(payrollDeduction.organizationId, organizationId),
            eq(payrollDeduction.id, deductionId),
          ),
        )
        .limit(1);

      if (!deductionRow) {
        throw new Error("Deduction not found");
      }

      await tx
        .update(payrollDeduction)
        .set({
          reason,
          description: description || null,
          amount: money(amountNum),
          updatedBy: session?.user?.id ?? null,
        })
        .where(
          and(
            eq(payrollDeduction.organizationId, organizationId),
            eq(payrollDeduction.id, deductionId),
          ),
        );

      await recomputeInvoiceAfterDeduction(
        tx,
        deductionRow.payrollInvoiceId,
        organizationId,
        session?.user?.id ?? null,
      );

      return deductionRow.payrollInvoiceId;
    });

    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Deduction updated successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

export const deletePayrollDeduction = withAuth<
  DeletePayrollDeductionSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["delete"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = deletePayrollDeductionSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { deductionId } = parsed.data;

    const invoiceId = await db.transaction(async (tx) => {
      const [deductionRow] = await tx
        .select()
        .from(payrollDeduction)
        .where(
          and(
            eq(payrollDeduction.organizationId, organizationId),
            eq(payrollDeduction.id, deductionId),
          ),
        )
        .limit(1);

      if (!deductionRow) {
        throw new Error("Deduction not found");
      }

      await tx
        .delete(payrollDeduction)
        .where(
          and(
            eq(payrollDeduction.organizationId, organizationId),
            eq(payrollDeduction.id, deductionId),
          ),
        );

      await recomputeInvoiceAfterDeduction(
        tx,
        deductionRow.payrollInvoiceId,
        organizationId,
        session?.user?.id ?? null,
      );

      return deductionRow.payrollInvoiceId;
    });

    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Deduction removed successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

// ---------------------------------------------------------------------------
// Payout logs (edit/delete)
// ---------------------------------------------------------------------------

export const updatePayrollPayout = withAuth<
  UpdatePayrollPayoutSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["update"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = updatePayrollPayoutSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { payoutId, method, reference, notes, receivedBy } = parsed.data;
    const amountNum = Number(parsed.data.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return {
        success: false,
        message: "Invalid amount",
        fieldErrors: { amount: ["Amount must be greater than 0"] },
      };
    }

    const invoiceId = await db.transaction(async (tx) => {
      const [payoutRow] = await tx
        .select()
        .from(payrollPayment)
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            eq(payrollPayment.id, payoutId),
          ),
        )
        .limit(1);

      if (!payoutRow) {
        throw new Error("Payout not found");
      }

      const [inv] = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, payoutRow.payrollInvoiceId),
          ),
        )
        .limit(1);

      if (!inv) {
        throw new Error("Payroll invoice not found");
      }

      const newPaidAmount =
        Number(inv.paidAmount) - Number(payoutRow.amount) + amountNum;

      if (newPaidAmount < 0) {
        throw new Error("Paid amount cannot be negative");
      }
      if (newPaidAmount > Number(inv.total)) {
        throw new Error("Paid amount cannot be greater than the net salary");
      }

      await tx
        .update(payrollPayment)
        .set({
          amount: money(amountNum),
          method,
          reference: reference || null,
          notes: notes || null,
          receivedBy: receivedBy || null,
          updatedBy: session?.user?.id ?? null,
        })
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            eq(payrollPayment.id, payoutId),
          ),
        );

      const newDue = Number(inv.total) - newPaidAmount;

      await tx
        .update(payrollInvoice)
        .set({
          paidAmount: money(newPaidAmount),
          dueAmount: money(newDue),
          status: decideStatus(newPaidAmount, Number(inv.total)),
          updatedBy: session?.user?.id ?? null,
        })
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, inv.id),
          ),
        );

      return inv.id;
    });

    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Payout updated successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

export const deletePayrollPayout = withAuth<
  DeletePayrollPayoutSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["delete"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = deletePayrollPayoutSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { payoutId } = parsed.data;

    const invoiceId = await db.transaction(async (tx) => {
      const [payoutRow] = await tx
        .select()
        .from(payrollPayment)
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            eq(payrollPayment.id, payoutId),
          ),
        )
        .limit(1);

      if (!payoutRow) {
        throw new Error("Payout not found");
      }

      const [inv] = await tx
        .select()
        .from(payrollInvoice)
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, payoutRow.payrollInvoiceId),
          ),
        )
        .limit(1);

      if (!inv) {
        throw new Error("Payroll invoice not found");
      }

      const newPaidAmount = Number(inv.paidAmount) - Number(payoutRow.amount);
      if (newPaidAmount < 0) {
        throw new Error("Cannot delete this payout");
      }

      await tx
        .delete(payrollPayment)
        .where(
          and(
            eq(payrollPayment.organizationId, organizationId),
            eq(payrollPayment.id, payoutId),
          ),
        );

      const newDue = Number(inv.total) - newPaidAmount;

      await tx
        .update(payrollInvoice)
        .set({
          paidAmount: money(newPaidAmount),
          dueAmount: money(newDue),
          status: decideStatus(newPaidAmount, Number(inv.total)),
          updatedBy: session?.user?.id ?? null,
        })
        .where(
          and(
            eq(payrollInvoice.organizationId, organizationId),
            eq(payrollInvoice.id, inv.id),
          ),
        );

      return inv.id;
    });

    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Payout deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});

// ---------------------------------------------------------------------------
// Void invoice
// ---------------------------------------------------------------------------

export const voidPayrollInvoice = withAuth<
  VoidPayrollInvoiceSchemaType,
  ActionResponse<null>
>({
  roles: ["orgUser"],
  permissions: { payroll: ["delete"] },
  requireActiveOrg: true,
})(async ({ data, organizationId, session }): Promise<ActionResponse<null>> => {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization not found" };
    }

    const parsed = voidPayrollInvoiceSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return { success: false, message: "Invalid data", fieldErrors };
    }

    const { invoiceId } = parsed.data;

    await db
      .update(payrollInvoice)
      .set({ status: "void", updatedBy: session?.user?.id ?? null })
      .where(
        and(
          eq(payrollInvoice.organizationId, organizationId),
          eq(payrollInvoice.id, invoiceId),
          ne(payrollInvoice.status, "void"),
        ),
      );

    revalidatePath(`/org/dashboard/payroll/${invoiceId}`);
    revalidatePath("/org/dashboard/payroll");

    return {
      success: true,
      message: "Invoice voided successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
});
