# Payroll Implementation Memory

## Architecture
- Payroll mirrors the student invoice system (invoice + line items + payments)
- Staff and teachers are payees via polymorphic FK (memberId OR teacherId)
- `payroll_contract` already exists with effective-dating for salary history

## Key Patterns
- **Contract splitting**: If salary changes mid-month, each contract period = separate line item
- **Pro-rata formula**: `monthlyAmount * (daysCharged / daysInMonth)` (same as student invoices)
- **Invoice number**: `PAY${year}${month}${payeeId.slice(0,8)}`
- **Due date**: 5 days from generation (same as student invoices)
- **Payment FIFO**: Oldest unpaid invoices paid first (same as student payments)

## Gotchas
- `payee_shape` CHECK constraint must match `payrollContract` logic
- Unique partial index prevents duplicate non-void invoices per payee per period
- `effectiveTo IS NULL` = currently active contract
- Multiple contracts per payee in same month = multiple line items (not multiple invoices)

## Reused Components
- `getPreviousMonth()` from `lib/billings/getPreviousMonth.ts` — **directly imported** (shared, no student-specific logic)
- `paymentMethod` enum from `payment-schema.ts` for payment methods
- `withAuth` wrapper from `lib/withAuth.ts` for server actions
- `orgPermissions` from `lib/org-permissions.ts` for access control
