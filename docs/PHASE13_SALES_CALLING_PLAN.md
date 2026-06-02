# Phase 13: Sales Calling / Telesale Planning & Schema Audit

## 1. Current Schema Audit
We reviewed the existing Prisma schema to understand current capabilities.

**Existing Models & Fields:**
*   **`Lead`**: Contains crucial sales fields: `stage`, `temperature`, `assignedToId`, `lastCallAt`, `nextFollowUpAt`, `callCount`, `lastCallOutcome`, `batchId`.
*   **`LeadBatch`**: Tracks imported lists of leads (`totalLeads`, `source`).
*   **`CallAttempt`**: Logs individual calls (`saleId`, `outcome`, `duration`, `calledAt`, `notes`). Links to Lead, Tenant, and assigned saleId.
*   **`CallOutcome` Enum**: Covers full lifecycle (`NO_ANSWER`, `BUSY_CALLBACK`, `INTERESTED`, `BOOKED_TRIAL`, `LOST`, etc.).
*   **`TrialBooking`**: Handles handoffs (`status`, `trialDate`, `assignedSaleId`).
*   **`FollowUpTask`**: Manages callbacks (`dueDate`, `isCompleted`, `assignedTo`). Links to Lead, Tenant, and User/assignedTo.
*   **`AiSuggestion` / `AiActionDraft`**: Supports AI-driven next actions.

## 2. Current UI Audit
*   **/workspaces/sales**: General sales dashboard (KPIs, leads summary, AI prompts).
*   **/leads**: Standard list/table view for managing leads, but not optimized for rapid-fire calling.
*   **/trial-bookings**: Table view for tracking scheduled trials.
*   **/fanpage-inbox**: Chat interface for inbound messages.
*   **Gap**: There is no dedicated UI for high-speed outbound calling (a "Call Queue" or "Power Dialer" interface) where a consultant can process 100+ leads/day efficiently.

## 3. Gap Analysis & Proposed Schema Changes
The core data structures for telesales (`LeadBatch`, `CallAttempt`, `CallOutcome`, `TrialBooking`, `FollowUpTask`) **already exist** natively in the schema.

**Conclusion**: **NO SCHEMA CHANGES ARE STRICTLY REQUIRED** to begin Phase 13. The existing models perfectly support the telesale workflow.

## 4. UX Plan: `/workspaces/sales/calling`
The page must be hyper-optimized for speed (100 calls/day). 

**Layout:**
*   **Top Strip (KPIs)**: `Hôm nay: 45/100 cuộc gọi | 3 Hẹn thử | 1 Chốt`
*   **Left Sidebar (Queue)**: List of `Lead`s assigned to the user, ordered by `nextFollowUpAt` (overdue first) and `temperature` (HOT first).
*   **Main Stage (Call Card)**:
    *   **Lead Info**: Name, Phone (clickable `tel:` link), Source, interested course.
    *   **History**: Last call outcome, past notes.
    *   **AI Suggestion**: "Lead này từng hỏi giá nhưng chưa chốt. Hãy nhấn mạnh ưu đãi tháng này."
*   **Action Panel (One-Click Outcomes)**:
    *   Grid of buttons mapped to `CallOutcome` (Không nghe máy, Sai số, Quan tâm, Đặt học thử...).

## 5. RBAC Plan
*   **Allowed**: `OWNER`, `ADMIN`, `SALE`
*   **Blocked**: `TEACHER`, `ACCOUNTANT`, `UNKNOWN`, Anonymous
*   **Implementation**: Add exact route matching for `/workspaces/sales/calling` in `src/lib/rbac.ts` under the `SALE` role.

## 6. AI & Safety Rules
*   **No Auto-Call**: The system only displays `tel:` links for manual dialing via Zalo/Phone.
*   **FollowUpTask Creation**: Happens *only* after a SALE manually selects a call outcome (e.g. "Hẹn gọi lại").
*   **TrialBooking Creation**: Form opens *only* after a SALE manually selects "Đặt học thử".
*   **AI / Zalo Drafts**: AI/Zalo draft generation is draft-only and must be triggered by explicit user action.
*   **No Auto-Send**: No background auto-send of messages or notifications.
*   **No Sensitive Data**: Sales staff cannot see finance data (handled via the Phase 12 RBAC API).

## 7. Test Plan
*   **RBAC Tests**: Ensure TEACHER/ACCOUNTANT get 403 on `/workspaces/sales/calling`.
*   **Call Logging**: Verify clicking an outcome creates a `CallAttempt` and increments `Lead.callCount`.
*   **Follow-up Automation**: Verify 'Hẹn gọi lại' creates a `FollowUpTask`.
*   **Trial Booking**: Verify 'Đặt học thử' creates a `TrialBooking` and updates `Lead.stage`.
*   **Tenant/Sale Isolation**: Ensure a SALE only sees their own assigned leads in the queue.

## 8. Implementation Phases
*   **13.0**: Planning & schema audit (Completed - No schema changes needed).
*   **13.2**: Sales Calling page shell *only*. (Read-only `/workspaces/sales/calling` shell, no mutation yet, no call outcome writes yet, no FollowUpTask creation yet, no TrialBooking creation yet, no AI draft creation yet, no auto-send).
*   **13.3**: Manual call outcome logging.
*   **13.4**: Follow-up task creation from outcome.
*   **13.5**: Trial booking handoff.
*   **13.6**: KPI/reporting.
*   **13.7**: AI suggestions/drafts.
