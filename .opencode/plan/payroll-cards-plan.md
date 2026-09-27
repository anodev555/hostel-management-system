# Payroll Cards Plan — staff/teacher salary-to-pay overview

## Goal
`app/org/dashboard/payroll` lists **all staff + teachers** (paid, unpaid, partial) as
attractive clickable cards showing how much salary still needs to be paid.
Clicking a card opens that person's payroll page with total metrics, Outstanding /
Completed / Payout-log tabs, and deduction features. Fully-paid staff must be
visible for history (currently impossible — list defaults to `outstanding`).

## Constraints (user-confirmed)
1. Top summary metrics (`Total billed / paid / remaining / Staff with dues`) — DO NOT change.
2. Search bar — keep as-is.
3. Cards fully **replace** the table (no toggle).
4. Card shows: avatar + name + role, prominent **Total need to pay till**.
5. List defaults to `status=all` (history visible).
6. Detail page already satisfies requirements — verify only, no redesign.

## Current state (verified 2026-09-27)
- `_components/payroll.tsx` — server component, defaults `status=outstanding`,
  forwards `payeeType|status|search|page|perpage` to `getPayrollInvoices`.
- `_components/payroll-list.tsx` — summary card + search-only bar + employee table
  + pagination. `applySearch` drops `payeeType|status` params.
- `action/payroll.ts#getPayrollInvoices` — already supports
  `outstanding|unpaid|partial|paid|all` + `payeeType` + name search, groups by
  `payeeType:payeeId`. No query change needed.
- `employee/[payeeType]/[payeeId]/_components/employee-detail.tsx` — header
  (`Total need to pay now` + 5 boxes) + 3 tabs + deductions + FIFO pay form. OK.
- `types/payroll-types.ts` — `PayrollSummary`, `PayrollEmployeeRow` cover cards.

## Phases
### Phase 1 — List backend / URL contract
- `payroll.tsx`: default `status` `outstanding` → `all`; accept
  `payeeType=all|staff|teacher` (`all` → `undefined`); default `perPage` 10 → 12
  (3-col grid friendly).
- Freeze `summary` computation.

### Phase 2 — Card grid UI (main work)
- New `_components/payroll-employee-card.tsx`: whole card is a
  `<Link href=/payroll/employee/[type]/[id]>`; avatar + name + type/role badge;
  hero `Total need to pay` (emerald 0 / destructive >0 / warning + `Past due`
  if `isOverDue`); mini-stats Net / Paid / `N due · M paid`; `formatStatus`
  badge; paid/net progress bar; `View →` affordance.
- Rewrite `payroll-list.tsx`: keep summary + search byte-identical; add filter
  chips (status: All / Need to pay / Unpaid / Partial / Paid; type: All / Staff /
  Teacher) via `router.push` query, reset `page`; replace `<Table>` with
  responsive grid; per-filter empty states; pagination options `[6,9,12,18]`.
- Update `payroll-skeleton.tsx` to card skeletons.

### Phase 3 — Detail verification
- Confirm Paid card → detail shows Completed + Payout logs; deductions locked
  message intact. No redesign.

### Phase 4 — QA
- Matrix: All shows paid+unpaid; each status chip; type filter; search (staff +
  teacher names); pagination; card → correct detail; 3 tabs intact.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`.
