# Memory — isActive Login Gate

Goal: block login when `user.isActive=false` or `organization.isActive=false`.

## Schema (already exists, no migration)
- `db/schema/auth-schema.ts:29` — `user.isActive boolean default(true)`
- `db/schema/auth-schema.ts:99` — `organization.isActive boolean default(true).notNull()`

## Messages (canonical)
- `USER_INACTIVE_MESSAGE = "You can't login, please contact hostel administrator or support."`
- `ORG_INACTIVE_MESSAGE = "Cannot login, please contact administration."`
- Defined once in `lib/auth-messages.ts`, reused by server + client.

## Decisions
- `superAdmin` bypasses org check (no single org), but is still blocked if own `user.isActive=false`.
- `orgUser` with memberships but zero active orgs → blocked with ORG message.
- `orgUser` with mixed active/inactive orgs → allowed, auto-selects first active org (ordered by `member.createdAt`).
- Enforcement is server-side in `databaseHooks.session.create.before` (covers username sign-in + all session paths), plus defense-in-depth in `withAuth` and layouts.
- Deactivation revokes sessions via `db.delete(session)` so kicked users can't reuse old cookies.

## Progress
- [x] Plan approved
- [x] `lib/auth-messages.ts` created
- [x] `lib/auth.ts` session gate
- [x] `app/login/login-form.tsx` message mapping
- [x] `lib/withAuth.ts` per-action re-check
- [x] `get-orgsidebarauth.ts` + admin layout re-check + org filter
- [x] `team-switcher.tsx` disable inactive orgs
- [x] `update-staffstatus.ts` revoke sessions on deactivate
- [x] `typecheck` — all touched files clean; remaining errors pre-existing & unrelated (`orgAdmin` role mismatch in create-organization.ts, staff-salary-utils.ts). `lint` has no eslint config in repo (pre-existing).
- [ ] Manual login test (needs dev server + DB): deactivate user → expect user message; deactivate org → expect org message; reactivate → login works.

## Super-admin seed
- `seed/super-admin.ts` — inserts/promotes `role=superAdmin` user with
  `username` + `credential` account (scrypt hash via `better-auth/crypto`),
  honoring 8–15 char username limits. Idempotent re-runs reset credentials.
- Fixed `seed:superadmin` script (was pointing at non-existent
  `seeds/superdmin-seed.ts`). Run: `npm run seed:superadmin`
  with `SUPERADMIN_EMAIL/USERNAME/PASSWORD[/NAME/PHONE]` env vars.
- Not executed (writes to real DB — run it explicitly when ready).

## Visitor module
Goal: track hostel visitor check-ins/check-outs (who visited which student + reason).

- [x] `db/schema/visitor-schema.ts` — `visitors` table (uuid PK, org FK cascade,
  visitorName/relation/age/expectedVisitDuration, studentId FK set-null +
  studentName snapshot, reason, checkinAt/checkoutAt, visitDate+year/month/day
  parts, createdBy/checkoutBy, 4 indexes, age/month checks). Exported from
  `db/schema/index.ts`. Migration `drizzle/0025_quick_beyonder.sql` generated;
  applied via `db:push` (DB journal empty — `db:migrate` is a no-op here).
  Verified 19 columns in DB.
- [x] `lib/org-permissions.ts` — `visitor: ["create","read","delete","checkout"]`
  (no update by design; owner inherits; custom roles need granting via Roles UI).
- [x] `visitors/schema/visitorSchema.ts` + `types/visitor-type.ts`.
- [x] `visitors/action/visitors.ts` — checkin (student org-check + name snapshot,
  server-stamped checkinAt), list (date filter + pagination + insideCount),
  checkout (org-scoped, rejects double checkout, stamps time + actor),
  delete (org-scoped), student dropdown options.
- [x] `components/visitors.tsx` (server) + `page.tsx` + `visitor-skeleton.tsx`.
- [x] `components/visitors-management.tsx` + filter (shadcn Calendar/Popover,
  from/to params) + checkin form + checkout button + delete dialog +
  `PaginationControls`. No edit path exists.
- [x] Sidebar nav entry (Visitors, `visitor:read` gated).
- [x] `typecheck` — zero errors in visitor files (only pre-existing `orgAdmin` /
  staff-salary errors remain). Schema imports cleanly at runtime.
- [ ] Manual test: check-in, date filter, per-page, double-checkout
  rejection, delete, student-name snapshot after student rename.

## Payroll inactive-staff billing (verdict: inactive staff ARE billed)
- `generatePayrollInvoicesPerOrg.ts:67-79` filters only org + date overlap —
  no `status='active'`, no payee check. Deactivation toggle sets only
  `user.isActive=false`, leaving contract open → billed monthly forever.
- Scope: generator filter only (no auto-close, teachers out of scope).

## Staff Mark as Left (detail page only)
- `staff/[staffId]/action/mark-staff-left.ts` — `staff:update` action: org-scoped
  guards (not found / self / already left) + last-working-day validation, then
  one transaction: close all active staff contracts (`inactive` + effectiveTo,
  clamped to effectiveFrom), `user.isActive=false`, delete live sessions.
  Member row kept (unlike Delete).
- `get-staffdetail.ts` selects `user.isActive`; `StaffDetail.isActive` added.
- `staff-markleft-dialog.tsx` — confirm dialog with last-working-day Calendar
  picker (no future dates); wired into `staffdetails-form.tsx` header beside
  Delete; replaced by "Left / Inactive" badge when `isActive=false`.
- Toggle (`updateStaffStatusAction`) unchanged = login access only.

## Room status switch (list only)
- `room-schema.ts`: new `updateRoomStatusSchema`; `status` removed from
  `editRoomSchema` (edit path can no longer accept status).
- `rooms.ts`: new `updateRoomStatusAction` (`room:update`) updating only
  status + updatedBy; `updateRoomAction` no longer touches status.
- `roomdetail-editform.tsx`: status Checkbox card + `status` default removed
  (unused `cn` import dropped).
- `room-status-switch.tsx` (new): optimistic Switch with revert-on-error,
  stopPropagation (row navigates to detail), `room:update`-gated in
  `room-list.tsx` beside the Badge.
- Semantics verified: `get-availableroom.ts:55` already filters
  `room.status='active'`, so toggling only gates new assignments —
  existing occupants unaffected.

## Status switch — lodging / tuition plans / teachers
Rolls the room pattern out to the three remaining status-owning modules.

### Ownership rule
`status` is owned by exactly two surfaces: the **list Switch** and a
**dedicated status action**. It is never part of the edit path. Concretely,
per module: a `update<Resource>StatusSchema`, a `update<Resource>StatusAction`
that writes only `status` + `updatedBy`, and `status` removed from the
edit schema/action and from the detail edit form. Create forms keep
defaulting to `active`.

### Shared component
`_components/status-switch.tsx` — presentational Switch (`checked`,
`pending`, `onToggle`, labels) with `stopPropagation` on click and
pointerdown, so the switch is safe inside a clickable row. `room-status-switch.tsx`
is intentionally left alone (it works; no refactor of working code).

### Lodging (`lodging` perms)
- `updateLodgingStatusSchema` added; `status` out of `editLodgingSchema`.
- `updateLodgingStatusAction` (`lodging:update`); `updateLodgingAction` no
  longer writes `status`.
- `lodging-list.tsx`: Badge + Switch next to each other (Switch gated
  `lodging:update`), Action column dropped, row click → detail only when
  `lodging:update`. `LodgingForm` trigger gated `lodging:create`.

### Tuition plans (`tuition` perms)
- Same five moves: `updateTuitionStatusSchema`, `updateTuitionStatusAction`
  (`tuition:update`), status block removed from the `[tuitionId]` edit form,
  list → Badge + Switch with Action column dropped and guarded row-click,
  `TuitionForm` trigger gated `tuition:create`.

### Teachers (`tuition` perms, **not** `teacher`)
Teacher actions live in `action/teacher.ts` and
`[teacherId]/action/teacher-updatedelete.ts` and are all authorized against
the **tuition** resource — there is no `teacher` resource in
`org-permissions.ts` despite one being declared there. Gating the UI on
`tuition:*` keeps client and server consistent; gating on `teacher:*` would
hide the switch from users who can actually use it.

- `editTeacherSchema` = `createTeacherSchema.omit({ status: true }).extend(...)`,
  so status can no longer arrive through the edit path.
- `updateTeacherStatusAction` (`tuition:update`): flips `tuitionTeacher.status`
  and, **on deactivate only**, closes every open teacher payroll contract
  (`status=inactive`, `effectiveTo=today`, clamped to `effectiveFrom` so the
  end date can never precede the start date, plus `updatedBy`).
  Reactivate deliberately does **not** reopen a contract — the admin
  re-activates the teacher by editing salary, and `updateTeacherAction`
  already mints a fresh contract as part of its salary-change rotation.
  `updateTeacherAction` keeps that rotation but no longer writes `status`.
- `editteacher-form.tsx` lost its status Select (and the now-unused Select
  imports). `teacher-list.tsx`: Badge + Switch (`tuition:update`-gated),
  Action column dropped, guarded row-click, Action-column `Link`/`PencilIcon`
  imports removed. `teacher-form.tsx` trigger gated `tuition:create`; the
  status Select stays there because new teachers are created active.

### Why the teacher case is different
For rooms/lodging/tuition, `status` is purely a gate on *new* assignments —
in-flight rows are untouched. For teachers it is not: a live payroll contract
is an open-ended billing liability, and `generatePayrollInvoicesPerOrg`
(`:67-79`) filters only org + date overlap, with no status or payee check.
Flipping the teacher switch alone would leave the contract open and keep
billing the org monthly — the same leak already recorded for inactive staff.
Closing the contracts inside the same transaction makes the toggle safe;
"mark as left" semantics, deliberately irreversible from the switch.

### Semantics (matches room)
- Switches gate new assignments only. `get-availableroom.ts:55` already
  filters active rooms; `createRoomAction` / `createTuitionAction` already
  require active plans and active teachers. Existing occupants and
  assignments are untouched by a toggle.
- Deactivating a lodging plan that still has live rooms is allowed — the FK
  is `restrict` on delete only.

### Open follow-ups (not built, tracked here only)
1. `generateInvoicesPerOrg` does not honour inactive tuition plans — an
   inactive plan keeps invoicing existing students.
2. The `generatePayrollInvoicesPerOrg` status/payee filter from the payroll
   investigation is still unimplemented; it remains the final safety net
   behind the teacher contract-closing above.

### Checklist used per module
1. `update<Resource>StatusSchema` added; `status` removed from edit schema.
2. `update<Resource>StatusAction` added; `status` stripped from the update action.
3. Status control deleted from the detail edit form (+ prune dead imports).
4. List: Badge + Switch, Action column removed, row click permission-gated.
5. Create-trigger permission-gated.
6. `npm run typecheck` clean for the touched files.

## Reports route (`/org/dashboard/reports`)
Fills the previously empty stub. One page, three tabs, one shared month-range
filter. Adds `recharts@3.10.1` (first chart dep in the repo; React 19 ok).

### Reports built
1. **Revenue by category** — `invoice_line_item.category` (tuition/lodging/food/fine),
   which was populated but never aggregated anywhere. Total, per-category share,
   stacked-by-month, and a total trend line.
2. **Expense analysis** — multi-month series + category breakdown. Fills the gap
   left by `getExpenseDashboardAction`, which is hard-pinned to the current
   calendar month with no way to change it.
3. **Payroll** — staff vs teacher split of invoiced/paid/outstanding, monthly
   cost, and the current monthly run-rate from open contracts. No existing screen
   grouped payroll by `payeeType`.

### Non-obvious decisions
- **Month range is a (year, month) pair, never raw dates.** Every reportable
  table stores a denormalised year/month pair, not one date column. Filtering the
  two columns independently is a real bug: `month <= toMonth` silently pulls in
  January of the *following* year. `monthRangeFilter()` uses a row constructor —
  `(year, month) between (a,b) and (c,d)` — the only correct formulation.
  Verified against Postgres: the tuple form executes and cross-year ranges behave.
- **Aggregate on amounts, never on `status`.** No check constraint ties
  `invoice.status` / `payrollInvoice.status` to the amount columns, so the label
  can drift. `dueAmount` is safe to sum because `*_due_matches` guarantees
  `due = total - paid`. `void` is excluded at the header level everywhere.
- **All money is `numeric(10,2)` and Drizzle returns strings** — summing with `+`
  concatenates. Every aggregate goes through `toNumber()` in `reports.ts`.
- **Series are zero-filled in JS** (`buildMonthSeries`) or recharts renders gaps
  for months with no rows.
- **Reused the existing `SummaryBox`** from `invoices/_components/utils.tsx`
  rather than adding a fifth near-identical copy. Share bars are plain CSS so
  they stay server-renderable; only chart bodies are `"use client"`.
- **Range is validated twice**: zod in the action (authoritative) and a
  no-op-if-invalid guard in the filter, so the UI cannot produce a range the
  action will reject. Capped at `MAX_RANGE_MONTHS = 24`.
- **Default range is the last 6 months**; URL params (`fromYear`/`fromMonth`/
  `toYear`/`toMonth`) so the range survives reload and tab switches, matching the
  `student-filter.tsx` convention.

### Two real bugs found while building
1. **`getPreviousMonth.ts:9` is hardcoded to `new Date("2026-09-01")`** — it always
   returns Aug 2026 regardless of the real date. Pre-existing; deliberately NOT
   reused by the reports, which use `defaultRange()` in the reports schema module
   instead. **Still needs its own fix.**
2. **Client-reference trap (hit during this work):** `defaultRange()` was first
   written in `report-filter.tsx`, which is `"use client"`. A plain function
   exported from a client module becomes a client reference when imported by a
   server component, so calling it during a server render throws. It now lives in
   the server-safe `report-schema.ts`. Keep pure helpers used by loaders out of
   `"use client"` files.

### Payroll: contract-only payees
`getPayrollSummary` seeds the per-payee map from **open contracts first**, then
accumulates invoices onto it. Otherwise a payee holding an active contract but
invoiced nothing in the range is counted in the run-rate while being absent from
the table. Confirmed real in the current data: the staff member with the 12,000
active contract (`test`) is not the one with the Aug invoice (`Ram Bahadur Karki`).

`activeRunRate` is point-in-time, not period-scoped, so it is deliberately kept in
its own field and never added into the range totals. The UI labels this.

### Permission
New `report: ["read"]` in `lib/org-permissions.ts`, gating all four actions
(`getReportsDataAction` plus the three per-report ones) and the nav entry.
Additive, no migration. As with `visitor`, **the owner inherits it but custom
roles must be granted it via the Roles UI.**

### Verified
- `npm run typecheck` — clean for all touched files (pre-existing `orgAdmin` /
  `staff-salary-utils` errors remain). `npm run build` compiles; it still fails
  only on the pre-existing `create-organization.ts` error.
- Ran all three report queries directly against the dev DB: revenue, expense and
  payroll groupings all return correct rows; the tuple range filter works
  including a cross-year range.
- Dev server serves `/org/dashboard/reports` (200, redirects to login without a
  session, no module errors); all recharts named exports confirmed present.
- [ ] **Manual, needs a session:** filter drives all three tabs, `void` invoices
  excluded, empty months render as zero, a permission-less org user sees no nav
  entry and gets 403, charts render in light + dark mode.

### Screen structure convention (repo-wide, verified across modules)
Every org screen follows the same skeleton. Reports were refactored onto it:
- `page.tsx` is **thin**: `mx-auto flex w-full max-w-7xl` wrapper + `Suspense`
  whose fallback is an **imported** skeleton component. It holds no logic.
- `_components/<screen>.tsx` — **async server wrapper**. Awaits `searchParams`,
  calls the `withAuth` action, renders `<ErrorPage>` on a failed response and
  `<ErrorResolver>` in a catch, then hands data to the management component.
- `_components/<screen>-management.tsx` — **presentational shell, `"use client"`**
  (verified: all three existing `-management` files are client). Root element is
  `w-full flex-col space-y-4`, starting with a `flex items-center justify-between`
  header block (title + muted subtitle, optional action on the right).
- `_components/<screen>-skeleton.tsx` — its own file, mirroring the real layout
  (header, filter, cards, content).
- `_components/<screen>-filter.tsx` — client filter, URL params via
  `usePathname`/`router.replace`.

Reports now match: `reports.tsx` (wrapper) + `reports-management.tsx` (client
shell) + `report-skeleton.tsx`. Two intermediate files were folded away —
`reports-loader.tsx` became `reports.tsx`, and `profit-loss-chart.tsx` was
merged into `report-charts.tsx` so all six charts live in one `"use client"`
module. Body roots changed from `flex flex-col gap-6` to
`w-full flex-col space-y-4`; inner grid/card gaps stay as-is because they are
local spacing, not screen rhythm.

Two skeleton styles exist in the repo: hand-rolled `bg-muted animate-pulse`
divs (visitors, expenses, payroll) and the shadcn `Skeleton` component
(students, staff, roles, tuition, and more). The shadcn one is the majority and
is what reports uses.

### Not built (deliberate)
- **CSV export** — view-only for this pass; the aggregate actions already return
  plain series arrays, so a CSV action is a small addition.
- Reports for collection rate, occupancy/beds and dues aging were scoped out in
  favour of the four built.
- Follow-ups from earlier sections still open: `generateInvoicesPerOrg` ignores
  inactive tuition plans, and the `generatePayrollInvoicesPerOrg` status filter
  is still unimplemented.

## Profit & loss (4th tab on `/org/dashboard/reports`)
Accrual basis, with cash + receivables as memo lines only.

### Shape
Revenue (tuition/lodging/food/fines) → direct costs (staff payroll, teacher
payroll, **food purchases**) → gross profit → operating expenses (rent,
utilities, maintenance, fuel, other) → net profit. Compared against the
equal-length period immediately before.

- **Accrual is the only defensible basis.** Revenue is earned in the housing
  month (invoice period), but cash lands 1–2 months later. In the current data
  the two are entirely disjoint — revenue 52,520 in Jun and Jul, cash 16,454 in
  Aug and 12,961 in Sep. A cash-basis P&L would show *zero revenue* in the
  months students were actually housed.
- **Food is a direct cost, not a double count.** Students are billed for food
  separately (`invoice_line_item.category = 'food'`) and the hostel records
  grocery expenses, so food revenue minus food purchases is real margin. This
  is the only category reclassification in the statement; food must never be
  counted in both blocks.
- **No AR rollforward is shown.** Waived fines (`student_fines.waived`) break
  the tie between AR movement and cash, so a derived movement would imply a
  reconciliation that does not hold. Levels only.
- **pctChange is null when the prior period is 0** — a percentage against zero
  is Infinity/NaN, so it renders as `—` rather than a fake -100%.
- One grouped query per source spans the **union** of both windows and is
  split in JS, halving the query count. 7 queries total.
- Cost lines invert the variance colour (a cost increase reads as bad).

### Correction: the "phantom payroll" claim was wrong
An earlier note (and the original plan) claimed teacher `fa`'s 17,419 was
phantom cost because the teacher had no *open* contract. **That was incorrect.**
Both August invoices are backed by a real contract covering that period:

| Payee | Period | Invoiced | Contract covering it |
|---|---|---|---|
| Ram Bahadur Karki (staff) | 2026-08 | 30,000 | 2026-07-31 → 2026-09-28, `inactive` |
| fa (teacher) | 2026-08 | 17,419 | 2026-08-10 → 2026-09-29, `inactive` |

Both contracts were *closed after* the work was done (leave / raise rotation),
which is normal — the accrued cost is correct. The detection is therefore on
**period overlap**, never on "is a contract open right now"; the latter would
accuse real payroll of being phantom. It uses `make_date(period_year,
period_month, 1) between effective_from and coalesce(effective_to, 'infinity')`
because the period columns are integers and must not be tuple-compared against
`date` columns. Verified: current data yields zero flags, and a negative
control (Jan 2026 → 0 contracts) confirms the check is not simply always-zero.

The `generatePayrollInvoicesPerOrg` status bug is still real — it just manifests
when a *closed* contract's `effectiveTo` sits in the future, so a future month
gets billed after someone has left. Not yet demonstrated in this dataset.

### Two SQL traps hit while building
1. **`between $2,$3 and $4,$5` is a syntax error.** Row constructors need
   parens: `between ($2, $3) and ($4, $5)`, which is what `monthRangeFilter`
   emits. Also, passing unused params makes Postgres fail with *"could not
   determine data type of parameter $N"*.
2. **A correlated subquery in a grouped select cannot read ungrouped columns**
   (*"subquery uses ungrouped column"*). The per-payee contract-count subquery
   therefore forces `organizationId`, `memberId` and `teacherId` into the
   `GROUP BY` alongside the functionally-determined `payeeId`.

### Verified
- P&L reconciled against the dev DB for Apr–Sep 2026: revenue 105,040
  (tuition 12,000 / lodging 71,000 / food 22,040) − direct 50,049 = gross 54,991
  (52.4%) − opex 10,464 (utilities 10,000 / maintenance 464) = **net 44,527
  (42.4%)**. Cash collected 29,415; closing receivables 75,625.
- `previousRange()` unit-tested over 6 cases: correct width and always
  contiguous with the current window, including January and cross-year starts.
  (First implementation was wrong for January ranges and could overlap the
  current period; rewritten to end the month before the range starts.)
- `typecheck` clean; `npm run build` compiles (still fails only on the
  pre-existing `create-organization.ts`); dev server serves the route with no
  module errors.
- [ ] **Manual, needs a session:** variance columns, `—` on a zero prior
  period, negative margins rendering, chart rendering in light + dark mode.

### Known limitation
Monthly figures are lopsided because there is no backfill: both generators use
`getPreviousMonth()`, hardcoded to `2026-09-01`, so payroll only ever ran for
August 2026 and expenses only exist for September. Jun/Jul show revenue with no
costs, Aug shows cost with no revenue. The **range totals are the trustworthy
number**; the chart carries an inline note saying exactly this. Fixing
`getPreviousMonth.ts` is a prerequisite for the monthly view to mean anything.

## P&L tab — REWRITTEN as cash & outstanding
The accrual P&L above was **replaced** at the user's request. Revenue is now
student payments (collected + outstanding), expenses are payroll (cash gone +
outstanding) plus the expenses table (cash gone only). Simpler and visual: no
prior-period comparison, no % change, no statement table.

### The core modelling rule
**`cash` and `outstanding` are on different timelines and are never added
together.** Cash is measured when money moved (`payment.paidAt`,
`payrollPayment.paidAt`, `expenses.expense_date`); outstanding is a live
`dueAmount` on invoices *raised* in the range. A payment can settle an older
bill, so `collected + outstanding` happens to equal billed in the current data
(29,415 + 75,625 = 105,040) but is a **coincidence, not an identity**, and
relying on it would silently break once older invoices exist.

The two headline nets are therefore each internally consistent:
- `netCash` = students.cash − payroll.cash − operations.cash
- `netPosition` = students.invoiced − payroll.invoiced − operations.cash

Verified to cross-check: `netPosition` (44,527) equals the old accrual bottom
line, confirming the two views describe the same reality on different bases.

### Operations has no outstanding, by construction
The `expenses` table has **no status column and no payable lifecycle** (18
columns, verified) — a row is only created once the money has already gone. So
operations.outstanding is always 0 by construction, not by omission. Stated in
the UI so it does not look like missing data.

### The two sides sit on different periods
Payroll *cash* left in September while the invoice it settles is August's. The
UI labels these separately ("Cash paid in range" vs "Outstanding on payroll
raised in range") so the mismatch does not read as a contradiction.

### New: filtering timestamp cash columns
`payment.paidAt` and `payrollPayment.paidAt` are timestamps, not the
denormalised `(year, month)` pair every other reportable table uses, so
`monthRangeFilter` cannot apply. New helpers in `report-schema.ts`:
- `cashDateRangeFilter(col, start, endExclusive)` →
  `col >= start::timestamp and col < endExclusive::timestamp`. **The column is
  compared bare, never wrapped in a function** — see the sargability note below.
- `cashMonthKey(col)` → `to_char(col, 'YYYY-MM')`, which matches
  `monthKey()`'s output format so the two maps align (verified for months
  1, 2, 8, 9, 12). `to_char` is fine here because grouping does not need
  index support.
- `rangeStartDate` / `rangeEndExclusiveDate`. The upper bound is **exclusive at
  the start of the following month**, not "last day of `toMonth`", because
  `paid_at` carries a time component — an inclusive `<= lastDay` on a date
  would silently drop anything recorded after midnight on the final day.
  Verified: 03-31 23:59:59.999999 excluded, 04-01 00:00:00 included,
  09-30 23:59:59.999999 included, 10-01 00:00:00 excluded.

`invoice`, `payrollInvoice` and `expenses` keep the tuple filter.

### Sargability: the `paid_date` generated column
The original filter was
`make_date(extract(year from paid_at)::int, extract(month from paid_at)::int, 1)
between from and to`. It was **correct but non-sargable** — `paid_at` appeared
only inside the expression, so it landed in the plan's `Filter`, and **no index
on `paid_at` could ever be used, no matter what indexes existed.** EXPLAIN
showed both shapes:
```
old: Filter: (make_date(EXTRACT(year FROM paid_at)::integer, ...) >= ...)
```
The column only exists inside the expression, so it is index-ineligible.

**Resolution: denormalise the day into a STORED generated column.**
- `payment.paid_date` and `payroll_payment.paid_date`:
  `date GENERATED ALWAYS AS ("paid_at"::date) STORED`.
  `STORED` (not `VIRTUAL`) is deliberate — `VIRTUAL` is recomputed per read and
  **cannot be indexed**. `GENERATED ALWAYS` means the app never sets it, so it
  cannot drift from the timestamp and no write path has to remember it.
  Existing rows were backfilled by Postgres automatically (verified 10/10 and
  2/2 rows match `paid_at::date`).
- Indexes `idx_payment_org_paid_date` and `idx_payroll_payment_org_paid_date`
  on `(organization_id, paid_date)` — org equality plus a date range, the shape
  the reports filter on.
- Migration `drizzle/0026_reflective_luckman.sql`, applied with `db:push`
  (per this repo's convention: `drizzle.__drizzle_migrations` stays empty, so
  `db:migrate` is a no-op here).

Proven with `SET enable_seqscan=off` (the planner prefers a seq scan on a
10-row table regardless), which now yields:
```
Index Scan using idx_payment_org_paid_date on payment
  Index Cond: ((organization_id = 'x') AND (paid_date >= '2026-04-01') AND (paid_date < '2026-10-01'))
```

**Drizzle gotcha:** a generated column cannot reference a sibling column via
`table` — `table` only exists in the extras callback, not the column
definition. Use the lazy form with the literal column name:
`date("paid_date").generatedAlwaysAs(() => sql\`"paid_at"::date\`)`.

### A time-zone trap in the month key
`to_char(paid_date, 'YYYY-MM')` on a **`date`** column silently resolves through
the **timestamptz** overload, dragging the session `TimeZone` into the
expression. It happens to round-trip correctly (the cast and the format both use
the same zone) — verified correct under `Pacific/Kiritimati` (+14) and
`America/New_York` (−4) — but it is a latent dependency. `cashMonthKey` now
casts explicitly:
`to_char(paid_date::timestamp, 'YYYY-MM')`, so no `timestamptz` appears in the
plan. Output format still matches `monthKey()`.

### Cash column range filter
`rangeStartDate` / `rangeEndExclusiveDate`. The upper bound is **exclusive at
the start of the following month**, not "last day of `toMonth`", because the
source is a timestamp and an inclusive `<= lastDay` on a date would drop
anything recorded after midnight on the final day. Verified: 03-31 23:59:59.999999
excluded, 04-01 00:00:00 included, 09-30 23:59:59.999999 included, 10-01 00:00:00
excluded.

### Dead code removed
`previousRange()` (only the P&L used it), `parseMonthKey()` (never used), the
`StatementLine`/`StatementBlock`/`ProfitLossSide` types, and the whole variance
table with its `TrendingUp`/`TrendingDown` change column. `monthDistance` stays
— still used by range validation and `buildMonthSeries`.

### Verified (Apr–Sep 2026, dev DB)
| Figure | Value |
|---|---|
| Collected from students | 29,415 |
| — of which flagged late | 12,961 |
| Outstanding on student invoices in range | 75,625 |
| Student invoiced in range | 105,040 |
| Paid out to staff/teachers | 30,000 |
| Outstanding on payroll raised in range | 17,419 |
| Payroll invoiced in range | 47,419 |
| Operational spend | 13,094 |
| **Net cash position** | **−13,679** |
| **Net position** | **44,527** |

Month keys, range bounds and all figures confirmed by direct SQL. `typecheck`
clean; `npm run build` compiles (still fails only on the pre-existing
`create-organization.ts`); dev server serves the route with no module errors.
- [ ] **Manual, needs a session:** negative cash card styling, split bars at
  100% width, late-payment figure, chart in light + dark mode.

### Outstanding follow-up
None for the cash-range problem — solved by the `paid_date` generated column
plus its `(organization_id, paid_date)` index. Note the other reportable tables
(`expenses`, `invoice`, `payroll_invoice`, `visitor`, fines) already carry
denormalised year/month columns, so `payment` / `payroll_payment` were the only
two cash tables that needed this.

