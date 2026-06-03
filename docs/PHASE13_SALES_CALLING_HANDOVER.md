# Phase 13 Sales Calling Handover

## 1. Executive Summary

Phase 13 delivered the Sales Calling workflow for EduOS, specifically tailored for a 100 calls/day telesale operation. This phase successfully built a robust, tenant-isolated sales calling page featuring manual call outcome logging, automatic follow-up task creation, trial booking handoff, real-time KPI reporting, and safe deterministic sales follow-up suggestions.

Tất cả các tính năng đều được thiết kế an toàn:
* Không có tự động gọi (no auto-call).
* Không có tự động gửi tin nhắn (no auto-send).
* Mọi thay đổi dữ liệu quan trọng đều chỉ được lưu trữ thông qua thao tác chủ động của người dùng.
* Phân quyền (tenant/sale scoping) được thực thi nghiêm ngặt.
* Nhân viên tư vấn (SALE) chỉ có thể xem và thao tác trên những lead đã được phân công cho mình.
* OWNER/ADMIN có quyền xem toàn bộ KPIs và dữ liệu trong phạm vi Tenant của mình.

## 2. Phase-by-Phase Summary

### 13.0 Planning
* Created `docs/PHASE13_SALES_CALLING_PLAN.md`.
* Conducted schema audit and confirmed existing models (Lead, CallAttempt, FollowUpTask, TrialBooking) were fully sufficient.
* No schema migration or `db push` was required.

### 13.2 Sales Calling Page Shell
* Initialized route `/workspaces/sales/calling` as a read-only shell.
* Designed the queue, KPI strip, call card, and safely disabled outcome buttons.
* Enforced RBAC strictly for OWNER, ADMIN, and SALE roles.

### 13.3 Manual Call Outcome Logging
* Enabled the Call Outcome buttons.
* Handled the creation of `CallAttempt` and the updating of `Lead.callCount`, `Lead.lastCallAt`, and `Lead.lastCallOutcome` via Prisma transactions.
* FollowUpTask and TrialBooking were deliberately deferred from this step.

### 13.4 Follow-up Task Creation
* Integrated automatic `FollowUpTask` generation for specific mapped outcomes (e.g. `NO_ANSWER`, `BUSY_CALLBACK`).
* Updated `Lead.nextFollowUpAt` synchronously.
* Prevented orphan tasks by wrapping the entire workflow inside a single Prisma transaction.

### 13.5 Trial Booking Handoff
* Configured the `BOOKED_TRIAL` outcome to safely spawn a `TrialBooking` record.
* Ensured no redundant `FollowUpTask` is created when a trial is booked.
* Required a valid `trialDate` input from the form without using fake snapshot data.
* Preserved strict no-send behavior.

### 13.6 Sales KPI Reporting
* Developed a read-only KPI strip reporting on: calls today, 100 calls target, remaining calls, uncalled leads, hot leads, trials today, follow-ups today, and booked-trial conversion rate.
* Built per-consultant performance aggregation for OWNER/ADMIN roles based on active sales staff.
* Isolated SALE members to exclusively view their own metrics.
* Avoided all database mutations.

### 13.7 Safe Sales Follow-up Suggestions
* Created a pure, deterministic UI helper to suggest polite Vietnamese copy based on call outcomes.
* Eliminated live LLM/API calls and avoided writing to `AiSuggestion` or `AiActionDraft`.
* Implemented the safe boolean flag `isMessageSuggested` to denote copyable items.
* Mapped `WRONG_NUMBER` to explicitly abort follow-ups ("Không cần nhắn").
* Delivered the copy functionality securely via a read-only textarea and a `navigator.clipboard` button.

## 3. Route Map

* `/workspaces/sales`
  - **Role:** Sales Dashboard entry point.
  - **Behavior:** Links out to the detailed caller workflow and overall pipeline metrics.
* `/workspaces/sales/calling`
  - **Role:** Primary telesales workspace.
  - **Behavior:** Displays the queue of leads, allows logging of call attempts/outcomes, reveals live KPIs, and offers read-only follow-up copy suggestions.
* `/leads`
  - **Role:** Standard CRM listing.
  - **Behavior:** Displays all leads. Phase 13 logic operates upon the models managed here.
* `/trial-bookings`
  - **Role:** Trial management.
  - **Behavior:** Reflects the `TrialBooking` entities dynamically created by successful `BOOKED_TRIAL` call outcomes in Phase 13.
* `/fanpage-inbox`
  - **Role:** Facebook interaction.
  - **Behavior:** Handles external inbound messaging. Untouched by Phase 13 to maintain strict outbox isolation.
* `/ai-center`
  - **Role:** AI operation hub.
  - **Behavior:** Handles actual `AiSuggestion` / `AiActionDraft` interactions. Untouched by Phase 13, confirming no unexpected AI mutations.

## 4. Data Model Usage

### `Lead`
* **Fields used:** `id`, `tenantId`, `callCount`, `lastCallAt`, `lastCallOutcome`, `nextFollowUpAt`, `assignedToId`, `stage`, `temperature`.
* **Purpose:** Central CRM entity tracking customer state.
* **Writes:** Phase 13 updates `callCount`, timestamps, and outcome properties via transaction.
* **Safety:** Protected by `tenantId` and `assignedToId` scopes.

### `LeadBatch`
* **Purpose:** Groups imported leads.
* **Writes:** None in Phase 13.

### `CallAttempt`
* **Fields used:** `id`, `tenantId`, `leadId`, `saleId`, `calledAt`, `outcome`, `notes`.
* **Purpose:** Auditable log of every phone call made.
* **Writes:** Phase 13 creates these records upon manual outcome submission.
* **Safety:** Bound strictly to `tenantId` and the active session's `userId`.

### `CallOutcome` (Enum)
* **Purpose:** Categorizes the result of the `CallAttempt` uniformly.

### `FollowUpTask`
* **Fields used:** `id`, `tenantId`, `leadId`, `assignedTo`, `dueDate`, `description`, `isCompleted`.
* **Purpose:** Manages the active to-do list for sales.
* **Writes:** Phase 13 conditionally creates these records based on mapped call outcomes.
* **Safety:** Always binds `assignedTo` to the executing `SALE` user.

### `TrialBooking`
* **Fields used:** `id`, `tenantId`, `leadId`, `assignedSaleId`, `trialDate`, `status`, `notes`.
* **Purpose:** Transitions a lead from a prospect to an active trial student.
* **Writes:** Phase 13 conditionally creates a booking when the `BOOKED_TRIAL` outcome is logged.
* **Safety:** Includes `assignedSaleId` and maps strictly to `tenantId`.

### `TenantMember`
* **Fields used:** `tenantId`, `userId`, `role`, `status`.
* **Purpose:** Evaluates RBAC constraints and gathers arrays of active sales staff.
* **Writes:** None in Phase 13.

### `User`
* **Fields used:** `email`
* **Purpose:** Displays readable consultant names in the OWNER KPI summary.
* **Writes:** None in Phase 13.

*(Note: `AiSuggestion` / `AiActionDraft` were strictly avoided in Phase 13 to ensure human-only control over the calling pipeline).*

## 5. Outcome Mapping Table

| Outcome Enum | Vietnamese Meaning | Creates CallAttempt? | Updates Lead call summary? | Creates FollowUpTask? | Updates Lead.nextFollowUpAt? | Creates TrialBooking? | Shows suggestion? | Sends external message? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NO_ANSWER` | Không nghe máy | Yes | Yes | Yes | Yes | No | Yes | **No** |
| `BUSY_CALLBACK` | Hẹn gọi lại | Yes | Yes | Yes | Yes | No | Yes | **No** |
| `INTERESTED` | Quan tâm | Yes | Yes | Yes | Yes | No | Yes | **No** |
| `ASKED_PRICE` | Hỏi học phí | Yes | Yes | Yes | Yes | No | Yes | **No** |
| `NEEDS_PARENT_APPROVAL`| Cần người nhà quyết định | Yes | Yes | Yes | Yes | No | Yes | **No** |
| `BOOKED_TRIAL` | Đặt học thử | Yes | Yes | No | No | Yes | Yes | **No** |
| `ATTENDED_TRIAL` | Đã học thử | Yes | Yes | No | No | No | Yes | **No** |
| `NOT_INTERESTED` | Từ chối | Yes | Yes | No | No | No | Yes | **No** |
| `WRONG_NUMBER` | Sai số | Yes | Yes | No | No | No | Yes | **No** |
| `PAID` | Đã đóng tiền | Yes | Yes | No | No | No | Yes | **No** |
| `LOST` | Thất bại | Yes | Yes | No | No | No | Yes | **No** |

## 6. RBAC and Data Isolation

**Allowed:** OWNER, ADMIN, SALE
**Blocked:** TEACHER, ACCOUNTANT, UNKNOWN, anonymous

**Rules:**
* **SALE Access:** Can only view and mutate leads where `Lead.assignedToId === userId`. If the `SALE` session is missing a valid `userId`, the page gracefully crashes with a safe error preventing tenant-wide leaks.
* **OWNER/ADMIN Access:** Permitted tenant-wide visibility and aggregation capability.
* **Tenant Isolation:** Every single `Prisma` query filters firmly by `{ where: { tenantId } }`. Cross-tenant manipulation is programmatically rejected on the backend. Client payloads do not dictate the `tenantId` or `userId`.

## 7. Transaction and Mutation Safety

All database mutations strictly utilize atomic Prisma Transactions (`prisma.$transaction`).

**Manual outcome logging transaction:**
* `CallAttempt.create`
* `Lead.update`

**Follow-up transaction:**
* `CallAttempt.create`
* `Lead.update`
* Conditional `FollowUpTask.create`

**Booking transaction:**
* `CallAttempt.create`
* `Lead.update`
* Conditional `TrialBooking.create`

**Rules:**
* If any component fails (e.g. invalid date payload), the entire transaction rolls back cleanly.
* Absolutely **no auto-send** or **auto-call** triggers are executed.
* No interference with sensitive tables (`Payment`, `Invoice`, `ParentReport`, `AiActionDraft`).

## 8. KPI and Reporting Details

**KPI Metrics Gathered:**
* Calls today
* Daily target (100)
* Remaining calls
* Uncalled leads
* Hot leads
* Trials booked for today
* Follow-ups created today
* Booked-trial calls made today
* Booking conversion rate

**Scoping Rules:**
* `SALE` users fetch exclusively `userId`-filtered metrics.
* `OWNER/ADMIN` users retrieve metrics bounded strictly by `tenantId`.
* **Per-consultant Performance:** The OWNER/ADMIN dashboard relies heavily on aggregating `CallAttempt` and `FollowUpTask` by `saleId`/`assignedTo` matched explicitly against verified `ACTIVE` `SALE` `TenantMember` IDs. 
* Safe fallback strings (e.g. "Chưa đủ dữ liệu") are surfaced when queries result in zero data, preventing `NaN` exceptions or fake `0%` metrics.

## 9. Safe Suggestion Copy

* **Helper File Path:** `packages/shared/src/lib/salesCallingSuggestions.ts`
* **Test File Path:** `packages/shared/src/tests/sales-calling-suggestions.test.ts`
* **Implementation:** The helper purely guarantees deterministic mapping between Prisma `CallOutcome` enums and safe, polite Vietnamese text strings.
* **Purity:** Functions without LLMs, external APIs, or database writes.
* **Control Flag:** Utilizes `isMessageSuggested` to dictate rendering of the clipboard payload.
* **Edge Case:** `WRONG_NUMBER` intentionally overrides messaging behavior safely.
* **Clipboard Limitation:** Implemented with `navigator.clipboard.writeText`, relying on a fallback `readOnly` textarea ensuring mobile usability.

## 10. Manual QA Checklist

**OWNER:**
- [x] Can successfully access `/workspaces/sales/calling`.
- [x] Sees aggregate, tenant-wide KPIs and per-consultant breakdowns.
- [x] Can log outcomes accurately on any tenant lead.
- [x] Can trigger synchronous follow-up creation.
- [x] Can effectively spawn trial bookings via the form.

**SALE:**
- [x] Can access `/workspaces/sales/calling`.
- [x] Lead queue strictly hides unassigned leads.
- [x] Successfully logs calls exclusively against assigned leads.
- [x] Server Actions correctly reject unauthorized unassigned lead mutations.
- [x] Bounced appropriately if missing session `userId`.

**TEACHER/ACCOUNTANT:**
- [x] Intercepted gracefully by `ForbiddenRoleMessage`.
- [x] Sees zero sales data.
- [x] Mutations entirely impossible.

**Security:**
- [x] Invalid outcomes are rejected at the Server Action boundary.
- [x] Cross-tenant leads throw errors natively.
- [x] Invalid `trialDate` inputs revert the transaction securely.
- [x] **No auto-send / No Outbox / No AI Draft created.**

## 11. Test Coverage Summary

**Test Suites:**
* **API Tests:** Validates core webhooks, commands, and dashboard boundaries.
* **RBAC Tests:** Confirms strict permission filtering blocks.
* **Command Parser Tests:** Validates AI command ingestion.
* **Sales Calling Tests:** Guarantees atomicity and scope for `validateAndLogCallOutcome` mutation limits.
* **Sales Calling Suggestions Tests:** Guarantees deterministic purity and string validation for helper suggestions.

**Known Test Counts:**
* API suites/tests: 4 / 37
* Shared suites/tests: 4 / 38
* Total suites/tests: 8 / 75

## 12. Known Limitations

* **Manual Calling Only:** There is currently no active VoIP/PBX integration; the application relies entirely on `tel:` protocol click-to-call.
* **No Automated Messaging:** SMS/Zalo messages cannot be sent directly from the outcome dashboard.
* **No AI Draft Sync:** AiActionDraft records are not generated by this workflow yet.
* **No Live LLM Constraints:** The suggestion helper is static string-based and not generated natively by Gemini/OpenAI on the fly.
* **Static Target:** The 100-call target is statically defined in the UI component and cannot be customized per user via settings yet.
* **Date Defaults:** Follow-up due dates rely on deterministic fallback offsets and cannot be specifically selected via calendar popup on log creation yet.
* **Booking Form Limits:** Trial bookings use the basic HTML5 `datetime-local` input format.
* **Infrastructure Dependencies:** Lack of a Permission Center and structured Audit Logs limit granularity in tracking.

## 13. Recommended Next Phases

* **Phase 14:** Permission Center + Audit Log
* **Phase 15:** CEO Snapshot Layer
* **Phase 16:** Connector Center / Health Monitoring
* **Phase 17:** Zalo VPS Production Hardening
* **Phase 18:** Fanpage Production Send + Approval Guard
* **Phase 19:** Finance 2.0 / VietQR / Debt Aging
* **Phase 20:** Parent Portal Lite
* **Phase 21:** Production Deployment / Backup / Monitoring
* **Phase 22:** Final Demo/Sales Kit

## 14. Final Safety Statement

**Phase 13 does not auto-call, does not auto-send, does not expose finance/teacher data, and does not allow SALE to operate outside assigned leads. All mutating flows are explicitly tied to manual user actions and safely executed via robust transaction isolation boundaries.**
