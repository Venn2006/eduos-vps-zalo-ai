# Phase 40 — Approval Outbox Architecture Plan

Objective: Create a production-safe architecture plan for future Zalo/Fanpage sending, without implementing real sending yet.

EduOS has already built:
* AI draft suggestion
* conversation intelligence
* message guardrails
* manual-review-only draft copy flow
* AuditLog foundation

This document designs the next safe layer:
Human approval → outbox queue → connector send → delivery status → audit log.

> **Important**: This phase must not send anything.

---

## 1. Draft lifecycle

The lifecycle of an AI draft transitioning into an outbound message is strictly defined as follows:

* `AI_DRAFT_CREATED`
* `PENDING_REVIEW`
* `NEEDS_EDIT`
* `REVIEWED`
* `APPROVED`
* `BLOCKED_BY_GUARDRAIL`
* `QUEUED_FOR_SEND`
* `SENDING`
* `SENT`
* `FAILED`
* `CANCELLED`

**Lifecycle Rules**:
* AI creates a draft only. It never initiates a send.
* Staff reviews the draft.
* Guardrail checker runs during the review/approval process.
* `BLOCKED` drafts cannot be queued under any circumstances.
* Approved drafts may be queued only by authorized roles.
* Send status (e.g., `QUEUED_FOR_SEND`, `SENDING`, `SENT`, `FAILED`) must be tracked separately from the human approval status.

## 2. Human approval rules

**Policy Rules**:
* AI never sends directly.
* Staff must review every draft.
* Guardrail checker must run before approval can be finalized.
* `BLOCKED` messages cannot be approved or queued.
* `OWNER` / `ADMIN` can approve messages tenant-wide.
* `SALE` can approve assigned lead conversations only if the tenant policy allows.
* `TEACHER` can approve academic/class messages only if the tenant policy allows.
* `ACCOUNTANT` can approve finance messages only if the tenant policy allows.
* High-risk messages require `OWNER` / `ADMIN` review.
* Group chat messages have stricter rules than private inbox messages.
* Tuition, private student information, payment reminders, and complaint replies may require admin review based on conversation intelligence flags.

## 3. Outbox safety architecture

Future outbox requirements must strictly adhere to the following:

* **Idempotency key required**: Every outbox message must have a unique, UUID-based idempotency key.
* **Server-derived identity**: `tenantId`, `actorUserId`, and `actorRole` must be derived from the server session context, never from client-provided payload data.
* **Connector isolation**: The connector account must be strictly tenant-scoped.
* **Explicit channel**: The channel (`ZALO`, `FANPAGE`, `SMS`, `EMAIL`) must be explicit and statically validated.
* **Destination validation**: Destination IDs (e.g. phone numbers, Zalo User IDs, Facebook PSIDs) must be validated server-side.
* **No connector secrets exposed**: The UI and client API must never receive connector secrets, tokens, or credentials.
* **Retry limit required**: The outbox worker must respect a hard limit on retries.
* **Failure reason required**: Any `FAILED` status must capture a normalized reason.
* **Delivery status required**: The outbox must support webhook callbacks or polling to transition messages to `SENT` or `FAILED`.
* **Duplicate-send prevention**: Relies on idempotency keys and database constraints to prevent duplicate sending.
* **Rate-limit recommendation**: The outbox worker must respect channel-specific rate limits to prevent account blocking.
* **Cancellation**: Messages can be cancelled before sending if they are still in the `QUEUED_FOR_SEND` state.

## 4. Audit events

Audit logs must track every state transition that affects send risk:

* `AI_DRAFT_CREATED`
* `MESSAGE_GUARDRAIL_CHECKED`
* `MESSAGE_GUARDRAIL_BLOCKED`
* `MESSAGE_DRAFT_REVIEWED`
* `MESSAGE_DRAFT_APPROVED`
* `MESSAGE_DRAFT_REJECTED`
* `MESSAGE_QUEUED`
* `MESSAGE_SEND_ATTEMPTED`
* `MESSAGE_SENT`
* `MESSAGE_SEND_FAILED`
* `MESSAGE_CANCELLED`
* `CONNECTOR_DELIVERY_STATUS_UPDATED`

**Audit Logging Rules**:
* Audit every state transition that affects send risk.
* Audit metadata must use a safe summary only.
* Do not store raw private message bodies in audit metadata.
* Do not store phone numbers, OTPs, tokens, passwords, API keys, or connector secrets in audit metadata.

## 5. Data privacy

* The raw outbound message may exist only in the appropriate draft/outbox record if necessary for actual sending.
* Audit metadata stores safe summary only.
* The UI should show message content only to authorized roles.
* Sensitive contexts such as tuition/payment/student performance require strict role filtering before access is granted.
* No private student data may be included in class group messages.
* No tuition reminders may be sent in class group messages.

## 6. UI flow

The future user interface flow for outbound messages:

1. **CEO Dashboard** → Views AI risk card.
2. **Fanpage/Zalo Inbox** filtered by draft.
3. Staff reviews draft.
4. Guardrail check automatically fires on the draft content.
5. Staff edits if needed.
6. Authorized approval is given.
7. Queue for send.
8. Outbox worker sends asynchronously.
9. Delivery status updates in the UI.
10. AuditLog records transition silently in the background.

**Vietnamese UX labels to be used**:
* “Nháp AI” (AI Draft)
* “Cần duyệt” (Pending Review)
* “Cần sửa” (Needs Edit)
* “Đã duyệt” (Approved)
* “Xếp hàng gửi” (Queued)
* “Đang gửi” (Sending)
* “Đã gửi” (Sent)
* “Gửi lỗi” (Failed)
* “Đã hủy” (Cancelled)
* “Bị chặn bởi kiểm tra an toàn” (Blocked by Guardrail)

## 7. What Phase 40 must NOT do

Explicitly documenting what is out of scope and prohibited for this phase:

* No real send mechanism.
* No webhook outbound.
* No Zalo connector call.
* No Facebook send call.
* No production outbox worker logic.
* No external API calls.
* No live LLM integrations.
* No new send button that bypasses manual review.
* No schema migration in this phase.

## 8. Future phase breakdown

### Phase 41 — Draft Approval Queue Foundation
* Develop the UI/logic for the review queue.
* No real sending.
* May utilize existing `AiActionDraft` / `AiSuggestion` models if deemed safe and sufficient.

### Phase 42 — Mock Outbox / Sandbox Delivery
* Create a mock outbox flow.
* Implement fake delivery status only.
* No external API connectivity.

### Phase 43 — Real Connector Send with Audit + Idempotency
* Implement real sending logic, triggered only after the approval queue and mock delivery logic pass safety reviews.
* Ensure connector credentials remain exclusively server-side.
* Full audit logging and idempotency checking are mandatory.
