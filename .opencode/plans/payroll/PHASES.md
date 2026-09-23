# Payroll Implementation Phases

## Phase 1: Database Schema [ ]
- [ ] Add `payroll_invoice_status` enum to `payroll-schema.ts`
- [ ] Add `payroll_invoice` table to `payroll-schema.ts`
- [ ] Add `payroll_invoice_line_item` table to `payroll-schema.ts`
- [ ] Add `payroll_payment` table to `payroll-schema.ts`
- [ ] Update `db/schema/index.ts` barrel exports
- [ ] Create `db/schema/relations/payroll-relations.ts`
- [ ] Generate and run migration

## Phase 2: Calculation Logic [ ]
- [ ] Create `app/org/dashboard/lib/payroll/` folder
- [ ] Implement `generatePayrollInvoicesPerOrg.ts` (imports shared `getPreviousMonth`, contract splitting, pro-rata)
- [ ] Create `index.ts` barrel export

## Phase 3: API Endpoint [ ]
- [ ] Create `app/api/generatePayrollInvoices/route.ts`

## Phase 4: Server Actions [ ]
- [ ] Create `app/org/dashboard/payroll/action/payroll.ts`
- [ ] Update `lib/org-permissions.ts` with payroll permissions

## Phase 5: Documentation [ ]
- [ ] Create `.opencode/plans/payroll/MEMORY.md`
