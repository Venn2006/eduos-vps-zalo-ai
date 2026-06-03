# Phase 19: Permission Center & Audit Log Schema Plan

## 1. Proposed Models
We plan to introduce dynamic RBAC overrides and comprehensive audit logging without disrupting the current hardcoded role matrix.

* **PermissionPolicy:** Defines custom roles or role overrides (e.g., creating a "Senior Sale" role with export capabilities).
* **PermissionOverride:** Granular grants/revocations at the user level (e.g., granting a specific TEACHER access to the finance module).
* **AuditLog:** A centralized table recording all critical mutations, approvals, and permission changes.

## 2. Permission Dimensions
* **Module Visibility:** Can the user see the `/workspaces/finance` page?
* **Data Visibility:** Can the user see all leads (Tenant-wide) or only assigned leads (Owner-scoped)?
* **Action Permission:** Can the user execute mutations?
* **AI Scope Permission:** What data can the AI access when this user queries it?
* **Approval/Send Permission:** Is this user authorized to approve an `AiActionDraft` for actual sending?

## 3. Suggested Modules
* dashboard
* ai-center
* sales
* sales-calling
* teacher
* finance
* fanpage
* zalo
* settings
* reports

## 4. Suggested Action Permissions
* `view` (Read-only)
* `create` (Create records)
* `update` (Modify records)
* `approve` (Approve AI drafts)
* `send` (Trigger outbound messages)
* `export` (Export CSV/Excel)
* `manage_settings` (Modify tenant settings or connectors)

## 5. Audit Events
* `permission.changed`
* `call_outcome.logged`
* `follow_up.created`
* `trial_booking.created`
* `ai_draft.created`
* `ai_draft.approved`
* `message.sent`
* `payment.updated`
* `invoice.updated`
* `connector.relogin`
* `user_role.changed`

## 6. Migration Approach
* **Add schema in future phase:** Do not run `db push` yet.
* **Seed defaults equal current RBAC:** Ensure backwards compatibility.
* **Dual-read fallback:** API first checks DB `PermissionOverride`, then falls back to hardcoded `rbac.ts`.
* **Rollout slowly:** Apply dynamic checks to non-critical routes first.
* **Rollback plan:** Retain `rbac.ts` logic intact.

## 7. UI Plan
* **Extend `/settings/permissions`:** Add a visual matrix of Roles vs Modules.
* **User Overrides:** A list view to manage exceptions.
* **Audit Log Viewer:** A searchable, filterable table for `AuditLog` events.
* **No Editing (Yet):** UI remains read-only until the backend models are migrated and stabilized.
