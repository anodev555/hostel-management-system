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
5. Create trigger permission-gated.
6. `npm run typecheck` clean for the touched files.
