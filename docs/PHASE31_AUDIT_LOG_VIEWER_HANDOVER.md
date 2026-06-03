# Phase 31: Audit Log Viewer Handover

## 1. Route Added
* `apps/web/src/app/settings/audit-log/page.tsx` added for viewing audit logs.
* Link to "Nhật ký hoạt động" added in `/settings`.

## 2. Access Rules
* Route access is governed by existing `canAccessRoute` logic.
* Since the route is within `/settings`, and only `OWNER` and `ADMIN` have the `*` permission covering `/settings`, this route is automatically hidden and protected from `SALE`, `TEACHER`, and `ACCOUNTANT`.
* Attempting to navigate directly returns the `<ForbiddenRoleMessage />`.

## 3. Query Rules
* Audit logs are queried using `prisma.auditLog.findMany`.
* Queries strictly filter by `tenantId` (derived purely from `getCurrentTenantOrThrow()` server-side).
* Results are limited to `take: 50`.
* Results are sorted by `createdAt: 'desc'` (newest first).

## 4. Data Safety Rules
* The UI is read-only (no export, no delete, no mutation).
* No raw JSON dump is exposed to the user interface.
* The system defensively parses `metadataJson` to extract *only safe summary fields* (e.g. `Kết quả: INTERESTED`), ensuring no raw message body, passwords, or phone numbers leak onto the DOM accidentally.

## 5. UI Behavior
* Simple list layout instead of dense Excel-style table, catering to users aged 35–55.
* Clean and readable layout matching `PageShell` design system.
* Pre-mapped Vietnamese action labels (e.g., `SALES_CALL_OUTCOME_LOGGED` -> "Sale đã ghi nhận kết quả cuộc gọi").
* Safe target identifiers (sliced IDs) and user identifiers.

## 6. Known Limitations
* Filters (Sales, AI, Finance) are currently UI mocks (chips) and not wired up to the database query logic yet. They show the conceptual direction.
* Audit log currently only contains newly instrumented events; legacy data mutations won't appear.

## 7. Test Status
* RBAC blocks correctly.
* Safe metadata rendering parses without crashing.
* Project successfully builds and typechecks without issue.
