# Phase 42: Mock Outbox / Sandbox Delivery Foundation

## Overview
This phase introduces a completely disconnected sandbox environment ("Mock Outbox") to safely test message queueing and state transitions without risking real message delivery. 

## What Was Added
- **Helper**: `packages/shared/src/lib/mockOutbox.ts` which manages sandbox statuses and deterministic transitions.
- **UI Route**: `/settings/mock-outbox` allowing administrators to observe and manually step through outbox statuses.
- **UI Component**: `MockOutboxClient` that clearly warns users they are in a mock environment with no real external side effects.
- **Integration**: A link was added to `/approval-queue` directing users to the mock outbox once a draft is approved.

## Mock Statuses
- `MOCK_READY` (Sẵn sàng giả lập)
- `MOCK_QUEUED` (Đã xếp hàng giả lập)
- `MOCK_SENDING` (Đang gửi giả lập)
- `MOCK_SENT` (Gửi giả lập thành công)
- `MOCK_FAILED` (Gửi giả lập lỗi)
- `MOCK_CANCELLED` (Đã hủy giả lập)

## Idempotency Behavior
An idempotency key is deterministically generated for each mock outbox item combining `tenantId`, `channel`, `draftId`, and `recipientId`. This strictly prevents duplicate mock queue entries.

## Strict Safety Constraints Implemented
- **No real send:** Transitions only mutate local state/mock items.
- **No connector call:** No HTTP/API logic exists in the mock transitions.
- **No external API / No live LLM:** Everything is self-contained.
- **No `MESSAGE_SENT` audit event:** Mock actions do not trigger production audit logs.
- **No production delivery status:** "SENT" is intentionally excluded in favor of "MOCK_SENT".
- **No Schema/Migration / DB Push:** All mock data relies on local state simulation for testing the queue pipeline logic visually.
- **No real outbox worker:** The mock pipeline is manually triggered by user clicks in the UI.

## Next Phase Recommendation
- **Phase 43 (Real Outbox Worker & Connector Foundation)**: Now that the mock sandbox is proven, the final step is to connect this queue logic to a robust database schema (`ZaloOutboxMessage`), run a real background worker, and safely handle real connector API deliveries with throttling and retry logic.
