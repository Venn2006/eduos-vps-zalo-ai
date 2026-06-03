# Phase 32: Dynamic Permission Foundation

## 1. What Was Added
* **Permission Defaults Helper**: Added `packages/shared/src/lib/permissionDefaults.ts` containing the `DEFAULT_PERMISSION_MATRIX` and the `hasDefaultPermission` function.
* **Test Suite**: Added `packages/shared/src/tests/permission-defaults.test.ts` to logically verify default matrices behave exactly as intended across all roles.
* **UI Updates**: Updated `/settings/permissions/page.tsx` to clearly present itself as a **Foundation Preview**, visualizing the current default settings that map directly to the hardcoded RBAC.

## 2. Why Hardcoded RBAC Remains the Fallback
Dynamic permission enforcement in a SaaS environment (especially handling sensitive PII like student data and sales chats) can inadvertently introduce catastrophic access escalation bugs if deployed rapidly.
* We strictly preserve `canAccessRoute` in `apps/web/src/lib/rbac.ts` as the absolute source of truth for current global routing.
* `hasDefaultPermission` is purely a building block for the UI/UX configurations we will enable next phase. Even if someone accidentally grants a "SALE" dynamic permission to view "REPORTS", the global hardcoded RBAC firewall will step in and return `<ForbiddenRoleMessage />`.

## 3. No Global Enforcement Yet
The new `hasDefaultPermission` helper is **not** imported into middleware or any server actions to block traffic yet. This guarantees zero downtime and zero broken tests for the current demo/release-candidate batch.

## 4. No DB Writes & No Schema Added
Because this phase focuses on the logical foundation (defining what modules exist and their default role association), no database schema modifications were necessary. We avoided adding a generic `PermissionPolicy` table because we want to carefully plan how Tenant/Role scopes are attached to User assignments before running a schema migration in production.

## 5. Safety Checklist
* [x] No `db push` executed.
* [x] No `canAccessRoute` logic removed or altered.
* [x] No new dependencies.
* [x] Settings page remains `OWNER/ADMIN` only.

## 6. Next Step Recommendation
* Design the `TenantRolePolicy` database schema linking user IDs, tenant IDs, and dynamic JSON module overrides.
* Begin using `hasDefaultPermission` overlaid with database policies strictly inside UI rendering (e.g. hiding menu buttons) before applying it to server actions.
