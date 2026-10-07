# Memory — Hostels Admin Page

## Task source
`app/admin/dashboard/hostels/hostels.md`
1. Hostels page for admin listing all hostels in table using TanStack React Table
2. Reusable data table with pagination, page-size and search bar
3. Fetch hostel data: logo, name, slug, createdAt, location, status, total students, staff count, owner name + id; top metric cards: total hostels, active, inactive; table with search + pagination; create button top-right (dialog form)
4. Fetch design from Stitch using MCP

## Stitch design (fetched via MCP, 2026-10-01)
- Project: `projects/14915922519071224953` — "Super-Admin Hostel Management UI"
- Screen used: `66da324f72314c92afe02d46a5481f54` — "Hostels Directory & Metrics - SuperAdmin"
- Layout: header (title + Export CSV + Create Hostel), 4 metric cards (total hostels / active / inactive nodes / total enrolled), regional density bar, filter row (search by name/slug/owner/city, status, location), table columns: HOSTEL | OWNER/LEAD | LOCATION | STUDENTS/ROOMS | STATUS | CREATED | ACTIONS, footer: rows-per-page + pagination

## Todos
- [x] Fetch Stitch design for hostels directory (MCP)
- [x] Create list hostels server action with metrics + search + pagination
- [x] Create reusable TanStack data-table component
- [x] Build hostels page UI (metric cards + table + create dialog)
- [x] Typecheck/lint and verify build

## Notes
- `npm run typecheck` passes for all new files. Remaining errors are
  pre-existing in untouched files (`create-organization.ts` role type,
  `staff-salary-utils.ts` contract type).
- ESLint has no config in repo (`eslint.config.*` missing) — lint skipped.
- Downgraded `@tanstack/react-table` 9.2.4 (beta API) → 8.21.3 (stable
  `useReactTable` / `getCoreRowModel` / `flexRender`) as no other code
  depended on v9.

## Review pass (2026-10-01, second request)
- `hostels-management.tsx` was formatter-mangled (stub component with dead
  imports/code nested after `return`) — rewrote cleanly.
- Shared table `components/data-table/` (v9 API) referenced two missing
  modules — created `utils/useDebounceCallback.ts` and
  `utils/pagination.ts` (`PAGESIZES = [5, 10, 15, 20]`, default 5 / max 20
  matching `parsePerPage` convention).
- Upgraded `@tanstack/react-table` 8.21.3 → 9.2.4 (shared table needs
  `useTable` / `tableFeatures` / `rowPaginationFeature`).
- Hostels page now uses shared `DataTable` + `DataTableSearch` +
  `useUrlParams`; URL params unified to `search` / `page` / `perPage`
  (+ `status`); removed old `SearchBar` + `PaginationControls` usage here.
- `organization-form.tsx`: toggle-button switch replaced with shadcn
  `Tabs` ("New owner" / "Existing owner"); also fixed existing-user
  buttons using the wrong loading flag (`isLoading` → `isLoadingExistingUser`).
- OPEN: `create-organization.ts` uses role `"orgAdmin"`, but DB enum
  `user_role` is only (`superAdmin`, `orgUser`) — new-owner creation will
  fail at the DB level and the existing-user path can never match. Needs a
  product decision + migration (add `orgAdmin` to enum, wire admin-plugin
  role, dashboard routing) — left untouched on purpose.

## Dialog-fit redesign (2026-10-01, third request)
- Root cause of overflow: dialog had been widened to `sm:max-w-5xl` with
  `overflow-y-auto` removed, while the form kept viewport-based
  `lg:grid-cols-2` (breakpoints respond to viewport, not the modal, so two
  cramped columns rendered inside the dialog).
- `CreateHostelForm` gained `variant: "page" | "dialog"` (default `"page"`;
  full-page route unchanged). Dialog variant: no page header, full-width
  2-col tab bar, always single-column sections, tighter gaps/padding
  (`pt-4`), default-size submit buttons.
- Dialog narrowed to `sm:max-w-xl` with `overflow-y-auto` restored and
  renders `<CreateHostelForm variant="dialog" />`.

## Grid redesign of organization form (2026-10-01, fourth request)
- `FieldGroup` hardcodes `flex flex-col`, so the three field groups were
  swapped for explicit grid divs (`fieldGrid`: single column in dialog,
  `sm:grid-cols-2` on page).
- Existing-owner tab: hostel name + location side by side, owner username
  full-width second row (`sm:col-span-2`).
- New-owner tab: hostel card 2-col; owner card uniform 2-col (name/email,
  phone/username, password/confirm).

## Decisions
- Owner = `member.role = "owner"` joined to `user` (Better Auth `creatorRole: "owner"`).
- Staff count = `member` rows per org excluding `owner` (matches `getAllStaffAction`).
- Student count = `student` rows per `organizationId`.
- Metrics (total / active / inactive / totalStudents) are global, not search-filtered.
- Reusable table lives at `components/data-table.tsx` (TanStack + shadcn `Table`).
- Search + pagination driven by URL params via existing `SearchBar` + `PaginationControls`.
