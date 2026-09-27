# Memory — payroll cards work

## Progress
- [x] Plan written (`.opencode/plan/payroll-cards-plan.md`)
- [x] Phase 1: `payroll.tsx` default `all` + perPage 12
- [x] Phase 2: `payroll-employee-card.tsx` + grid list + filter chips
- [x] Phase 2b: `payroll-skeleton.tsx` card skeletons
- [x] Phase 3: detail page verified (already has Outstanding/Completed/Payout
      tabs + deductions — no change)
- [x] Phase 4: `tsc` clean for payroll, prettier applied, dev-server 200 OK

## Decisions (user, 2026-09-27)
- Default filter: All (history visible)
- Cards replace table (no toggle)
- Card fields: avatar + name + role, Total need to pay (plus net/paid/counts,
  status, overdue — added as free value)
- memory location: `.opencode/plan/`
- Top metrics + search: untouched

## Files touched
- `app/org/dashboard/payroll/_components/payroll.tsx` — default status
  `outstanding` → `all`, default perPage 10 → 12
- `app/org/dashboard/payroll/_components/payroll-employee-card.tsx` — NEW
- `app/org/dashboard/payroll/_components/payroll-list.tsx` — table → card grid
  + status/type filter chips, search preserved, summary untouched
- `app/org/dashboard/payroll/_components/payroll-skeleton.tsx` — card skeletons

## QA notes (2026-09-27)
- `tsc --noEmit`: zero errors in payroll files (repo has pre-existing errors
  elsewhere: students layout, admin breadcrumb, staff-salary-utils).
- No eslint config in repo (`lint` script unusable repo-wide, pre-existing).
- `next dev` (:3000) → `/org/dashboard/payroll` returns 200, compiles clean.
- Page content is auth-gated/client-rendered — manual browser check still needed:
  All chip shows paid+unpaid, each status/type chip, search, pagination,
  card → correct `employee/[type]/[id]` detail.
- Pre-existing warning (out of scope): employee detail route accessed without
  `<Suspense>` boundary (`blocking-route`).

## Follow-up (2026-09-27) — filters removed, search only
- `payroll-list.tsx`: status/type filter chips removed; search-only + card grid
  with Unpaid / Partial / Cleared badges.
- `payroll.tsx`: always fetches `status: "all"` (no status/payeeType params).
- `payroll-employee-card.tsx`: fully-paid cards show emerald `Cleared` badge.
- `tsc`: zero payroll errors; dev server 200 OK.

## Optimize (2026-09-27) — getPayrollInvoices slimmed down
- Why the deduction query existed: it fed `deductionTotal`/`totalGross`,
  which no card displays — pure overhead (extra round-trip + map + math).
- Removed: 2nd `payrollDeduction` aggregate query, `deductionByInvoice` map,
  `_gross/_ded/_net/_paid/_due` temp fields, two-pass map, 4x `reduce` +
  2x `filter` summary passes (now one loop).
- Kept: single invoice SELECT (dropped `id`, `subTotal` columns), simple
  group-by-person loop, sort, paginate, summary.
- `PayrollEmployeeRow`: dropped `totalGross`, `deductionTotal`,
  `totalInvoices` (nothing consumed them).
- `tsc`: zero payroll errors; dev server 200 OK.

## Sort removed (2026-09-27)
- Deleted the `employees.sort(...)` block (highest remaining first, then name)
  from `getPayrollInvoices` — cards now render in DB/grouping order.
- `tsc`: zero payroll errors.

## Table view (2026-09-27) — cards removed
- Deleted `payroll-employee-card.tsx`.
- `payroll-list.tsx`: table with Name / Type / Status (Unpaid/Partial/Cleared)
  / Remaining to pay (0.00 when cleared) / Due (Past due date badge) / View.
  Search + summary untouched.
- `getPayrollInvoices`: select trimmed (dropped image/role/subject columns);
  per-person entry keeps only remaining + paid-so-far + overdue; summary
  totals come from slips in the same loop.
- `PayrollEmployeeRow`: now only payeeType/payeeId/payeeName/totalRemaining/
  status/isOverDue.
- `payroll.tsx` default perPage back to 10; skeleton back to table rows.
- `tsc`: zero payroll errors; dev server 200 OK.

## Deduction form split (2026-09-27)
- Deleted combined `deduction-form.tsx` (mode="add"|"edit").
- New `employee/_components/deduction/` folder:
  - `add-deduction-form.tsx` → `AddDeductionForm({ invoiceId })`
  - `edit-deduction-form.tsx` → `EditDeductionForm({ deduction })`
    (dropped unused `invoiceId` prop)
  - `deduction-form-fields.tsx` → shared reason/amount/description fields +
    `DEDUCTION_REASONS`, unique input ids via `idPrefix`.
- Usages: shared invoice table → Add; row actions → Edit.
- `tsc` zero payroll errors; employee route 200 OK.

## Component reorganization (2026-09-27)
- Moved (via `git mv`) `deduction-form`, `deduction-row-actions`,
  `payout-log-actions`, `confirm-dialog` from `[invoiceId]/_components` into
  `employee/[payeeType]/[payeeId]/_components/` (the working page owns them).
- `employee-detail.tsx` now uses local `./` imports.
- `[invoiceId]/payroll-detail.tsx` still works — imports the 4 shared files
  from the employee folder; only `pay-salary-form` remains local to it.
- Fixed deeper `../../../../action|schema` relative paths in moved files.
- Verified: `tsc` zero payroll errors; list + employee + invoice routes 200 OK.

## Notes
- `getPayrollInvoices` already handles `all|paid|unpaid|partial` — no DB change.
- `employee-detail.tsx` already has Outstanding/Completed/Payout tabs + deductions.
