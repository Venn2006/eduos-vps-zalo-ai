# Phase 14 Permission Center Audit Plan

## 1. Current RBAC Matrix
* OWNER: Has tenant-wide access, can see all workspaces and settings.
* ADMIN: Similar to OWNER, manages tenant settings and all workspaces.
* SALE: Scoped to sales workspaces and assigned leads only.
* TEACHER: Scoped to academic workspaces and assigned classes.
* ACCOUNTANT: Scoped to finance workspaces.
* UNKNOWN: Blocked from all protected routes.

## 2. Current Protected Routes
* `/dashboard`
* `/ai-center`
* `/workspaces`
* `/workspaces/sales`
* `/workspaces/sales/calling`
* `/workspaces/teacher`
* `/workspaces/finance`
* `/reports`
* `/settings`
* `/leads`
* `/trial-bookings`
* `/classes`
* `/attendance`
* `/homework`
* `/students`
* `/payments`
* `/renewals`
* `/fanpage-inbox`
* `/zalo-inbox`
* `/zalo-groups`
* `/zalo-accounts`

## 3. Proposed Future Permission Center
* Role-level permissions: Allow OWNER/ADMIN to toggle specific module access for SALE/TEACHER/ACCOUNTANT.
* User-level overrides: Allow exceptions for specific `TenantMember` users.
* Module visibility: Toggle modules on/off globally.
* Data visibility: Restrict views to "Own data only" vs "All tenant data".
* Action permissions: Toggle permissions like "Can delete lead", "Can edit payment".
* AI permission scopes: Control which roles can interact with AI Center features.

## 4. Safe Defaults
* **OWNER/ADMIN:** All modules and tenant data.
* **SALE:** Sales workspace, inbox, AI scoped only. Assigned leads only.
* **TEACHER:** Academic workspace, AI scoped only. Assigned classes only.
* **ACCOUNTANT:** Finance workspace, AI scoped only.

## 5. What Needs Schema Later
* `PermissionPolicy`
* `PermissionOverride`

## 6. What Can Be Done Now Without Schema
* Read-only Permission Center shell (`/settings/permissions`).
* Route matrix display showing current defaults.
* Documentation and audit events list.
