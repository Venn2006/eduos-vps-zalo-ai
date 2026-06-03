# Phase 41: Draft Approval Queue Foundation

## Overview
This phase introduces the foundational logic and UI for a Draft Approval Queue. The primary goal is to provide a unified place for owners, admins, and authorized staff to review AI-suggested message drafts before they are used.

As per the Phase 40 architecture rules, **no real sending occurs in this phase**.

## What Was Added
- **`apps/web/src/app/approval-queue`**: A new route displaying all drafts pending approval.
- **`packages/shared/src/lib/draftApprovalQueue.ts`**: The core logic helper for evaluating draft approvals based on role, category, and risk level.
- **Tests**: Thorough test coverage in `draft-approval-queue.test.ts` for all 12 required behaviors.

## Behaviors and Guardrails

### Approval Statuses (Vietnamese UI)
- `PENDING_REVIEW` -> "Nháp cần duyệt"
- `NEEDS_EDIT` -> "Cần sửa"
- `APPROVED_FOR_MANUAL_USE` -> "Duyệt nháp để sử dụng thủ công"
- `REJECTED` -> "Từ chối"
- `CANCELLED` -> "Đã hủy"
- `BLOCKED_BY_GUARDRAIL` -> "Chặn bởi AI Guardrail"

### Role Boundaries
- **OWNER / ADMIN**: Can approve safe drafts across all categories. They are the only ones allowed to approve `HIGH` or `CRITICAL` risk drafts.
- **SALE**: Can only approve `SALES` or `GENERAL` drafts if the risk is `LOW` or `MEDIUM`.
- **TEACHER**: Can only approve `ACADEMIC` or `GENERAL` drafts.
- **ACCOUNTANT**: Can only approve `FINANCE` or `GENERAL` drafts.
- **UNKNOWN**: Blocked from approving any drafts.

### Guardrail Integration
- If a draft is evaluated as `BLOCKED` by the guardrail, it cannot be approved and immediately falls into `BLOCKED_BY_GUARDRAIL`.
- If a draft is `NEEDS_REVIEW`, it defaults to `NEEDS_EDIT`.
- Sensitive information (phone, OTP, token, password) is redacted in the `safeSummary` view using the existing `timelineBuilder` redaction utility.

## Hardening and Safety Rules Applied
- **No auto-send:** The system only approves for *manual use* (`APPROVED_FOR_MANUAL_USE`). The user must manually copy/use the draft in the inbox.
- **No queue-for-send:** The transition to `QUEUED_FOR_SEND` does not exist in the Phase 41 helper.
- **No connector send:** Zero API calls are made to Zalo or Facebook in this flow.
- **No outbox worker:** The background worker is intentionally not implemented.
- **No external API / No live LLM:** Everything relies on deterministic, local logic and existing mock models.
- **No schema/migration / No db push:** Relies entirely on UI and shared package logic without modifying the database structure.

## Known Limitations
- The current queue is populated with mock data (`MOCK_DRAFTS` in `ApprovalQueueClient`) because `ZaloOutboxMessage` fetching was not fully implemented to respect the "no schema/db push" constraint of Phase 41.
- "Approve" simply updates the local React state and indicates that the draft is ready for manual use.

## Next Phase Recommendation
- **Phase 42 (Outbox Worker Foundation)**: We recommend setting up the actual database queries for the queue (using `ZaloOutboxMessage`), and implementing the background worker that safely transitions approved drafts into the real connector delivery pipeline.
