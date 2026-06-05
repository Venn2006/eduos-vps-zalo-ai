# Phase 71: Task Management / Giao Việc Workspace

## 1. Context
EduOS currently lacks a centralized workspace for Managers/CEOs to assign and track tasks (giao việc) related to leads, students, and parents.

## 2. Goal
Build a beautiful, practical **Giao việc / Task Management Workspace** that provides clear visibility into daily workloads, overdue items, waiting approvals, and staff capacity.

## 3. What Changed
- Added new route `/tasks` for Task Management.
- Created `TaskManagementClient` with Kanban board, KPI cards, staff workload panel, and task detail drawer.
- Added deterministic mock data for tasks and staff workloads in `taskManagementDemoData.ts`.
- Updated `AppLayout.tsx` to include "Giao việc" in the main navigation with a `ClipboardList` icon.

## 4. Route Affected
- `/tasks` (NEW)
- `/dashboard` (Untouched, layout shared)

## 5. Demo Data Model
- Tasks have statuses: `NEW`, `IN_PROGRESS`, `WAITING_APPROVAL`, `OVERDUE`, `DONE_DEMO`.
- Data is entirely hardcoded in local state to ensure deterministic presentations without DB mutations.

## 6. UI Behavior
- Kanban columns allow tracking tasks by stage.
- KPI cards track critical metrics (overdue, waiting approval).
- Clickable task cards open a detail drawer showing AI drafts, CRM context, timeline, and demo actions.
- The staff panel shows workloads across the team.

## 7. Staff Workflow Value
- Staff can easily see "what to do today" without digging through various inbox views.
- Contextual information (phone, lead source) is right on the task.

## 8. CEO Value
- Complete visibility into staff capacity, overdue issues, and daily progress.
- Can re-assign workloads to prevent bottlenecks.

## 9. Safety Boundaries
- **No DB Push/Migrations:** Data is pure frontend state.
- **No Real Sending/Credentials:** Action buttons only change local state and show "(Demo)".
- **Masked Data:** Phone numbers and identities are strictly fake/masked.

## 10. Manual QA Checklist
- [ ] Verify `/tasks` loads correctly.
- [ ] Verify "Giao việc" appears in the sidebar.
- [ ] Verify Kanban columns populate with data.
- [ ] Click a task -> drawer opens.
- [ ] Click "Hoàn tất (Demo)" -> status updates locally.
- [ ] Check responsive layout on mobile.

## 11. Next Recommended Phase
`Phase 72 — Team Inbox / Zalo Hotline Governance Demo`
