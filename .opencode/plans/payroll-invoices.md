# Payroll Invoices - Implementation Plan

## Overview

Implement payroll invoice generation and payment tracking for staff and teachers, mirroring the student invoice system. Payroll invoices are generated monthly (previous month's salary billed on the 1st of the current month), with support for salary changes within a billing period.

---

## Phase 1: Database Schema (payroll_invoice + payroll_payment tables)

### 1.1 Add `payroll_invoice` table to `db/schema/payroll-schema.ts`

New enums:
- `payroll_invoice_status`: `unpaid`, `paid`, `partial`, `void`

New table columns:
- `id` (UUID PK), `organizationId` (FK org), `payeeType` (staff/teacher), `memberId` (nullable FK), `teacherId` (nullable FK)
- `invoiceNumber`, `periodYear`, `periodMonth`, `periodStart`, `periodEnd`
- `issuedAt`, `dueDate`, `subTotal`, `total`, `paidAmount`, `dueAmount`
- `status`, `notes`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- CHECK constraint: `payee_shape` (same logic as payrollContract)
- Unique partial index: one non-void invoice per (org, payeeType, payeeId, year, month)

### 1.2 Add `payroll_invoice_line_item` table

Columns:
- `id`, `payrollInvoiceId` (FK), `organizationId` (FK), `description`, `amount`
- `chargeStartAt`, `chargeEndAt`, `daysCharged`, `daysInMonth`, `isProrated`
- `contractId` (FK to payrollContract), `createdAt`
- CHECK: amount > 0, dates valid, daysCharged <= daysInMonth

### 1.3 Add `payroll_payment` table

Columns:
- `id`, `payrollInvoiceId` (FK), `organizationId` (FK), `payeeType`, `memberId`, `teacherId`
- `amount`, `method` (reuse `paymentMethod` enum), `reference`, `paidAt`, `notes`
- `receivedBy`, `collectedBy`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- CHECK: amount > 0

### 1.4 Update barrel exports in `db/schema/index.ts`

### 1.5 Create `db/schema/relations/payroll-relations.ts`
- payrollContract -> many payrollInvoice
- payrollInvoice -> one payrollContract, many lineItems, many payments
- payrollInvoiceLineItem -> one payrollInvoice
- payrollPayment -> one payrollInvoice

### 1.6 Generate migration with `npx drizzle-kit generate`

---

## Phase 2: Payroll Calculation Logic

### 2.1 Create `app/org/dashboard/lib/payroll/` folder

### 2.2 `generatePayrollInvoicesPerOrg.ts`
- **Directly imports** `getPreviousMonth` from `@/app/org/dashboard/lib/billings/getPreviousMonth` (shared function, no student-specific logic)
Core logic (mirrors `generateInvoicesPerOrg.ts`):

1. Query active contracts overlapping the billing period
2. For each contract, calculate pro-rated amount:
   - `chargeStart = max(contract.effectiveFrom, periodStart)`
   - `chargeEnd = min(contract.effectiveTo ?? periodEnd, periodEnd)`
   - `daysCharged = (chargeEnd - chargeStart) + 1`
   - `amount = monthlyAmount * (daysCharged / daysInMonth)`
3. If multiple contracts for same payee in same month -> separate line items
4. Group by payee, skip already-billed
5. Create invoices in transaction with line items

### 2.3 `index.ts` barrel export

---

## Phase 3: API Endpoint

### 3.1 `app/api/generatePayrollInvoices/route.ts`
- POST handler (same pattern as `app/api/generateInvoices/route.ts`)
- No auth middleware (cron/admin triggered)
- Iterates all orgs, generates payroll invoices, returns summary

---

## Phase 4: Server Actions for Payments

### 4.1 `app/org/dashboard/payroll/action/payroll.ts`
- `getPayrollInvoices` - list with filters
- `getPayrollInvoiceDetail` - single invoice + line items
- `collectPayrollPayment` - FIFO payment collection
- Wrapped with `withAuth` + `payroll` permissions

### 4.2 Update `lib/org-permissions.ts`
Add `payroll: ["create", "read", "update", "delete"]`

---

## Phase 5: Memory & Documentation

### 5.1 `.opencode/plans/payroll/PHASES.md`
### 5.2 `.opencode/plans/payroll/MEMORY.md`

---

## Files to Create
| File | Purpose |
|---|---|
| `app/org/dashboard/lib/payroll/generatePayrollInvoicesPerOrg.ts` | Core generation logic (imports shared `getPreviousMonth`) |
| `app/org/dashboard/lib/payroll/index.ts` | Barrel export |
| `app/api/generatePayrollInvoices/route.ts` | POST API endpoint |
| `app/org/dashboard/payroll/action/payroll.ts` | Server actions |
| `db/schema/relations/payroll-relations.ts` | Drizzle relations |

## Files to Modify
| File | Change |
|---|---|
| `db/schema/payroll-schema.ts` | Add 3 new tables + enums |
| `db/schema/index.ts` | Add exports |
| `lib/org-permissions.ts` | Add payroll permission |

## Key Design Decisions
1. **Shared `getPreviousMonth()`** — imported directly from `lib/billings/` (no duplicate logic)
2. Reuse `paymentMethod` enum for payroll payments
2. Contract-based line items (salary changes = separate line items)
3. Pro-rata: `monthlyAmount * (daysCharged / daysInMonth)`
4. Invoice number: `PAY${year}${month}${payeeId.slice(0,8)}`
5. Same period logic as student invoices
6. FIFO payment collection
