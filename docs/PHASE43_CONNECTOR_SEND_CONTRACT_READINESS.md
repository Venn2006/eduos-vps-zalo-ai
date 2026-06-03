# Phase 43: Connector Send Contract & Audit Readiness

## Overview
This phase defines the strict **Connector Send Contract**, a deterministic evaluation gate before any message can be considered for real delivery. 

## Why this phase does not send
Phase 43 acts as a final safety check. Although we evaluate real constraints, `canSendRealNow` is explicitly hardcoded to `false`. We do not connect to external APIs or instantiate real outbox workers yet. This ensures that the complex validation rules can be merged and tested without accidentally triggering real-world side effects.

## What was added
- **Helper:** `packages/shared/src/lib/connectorSendContract.ts`
- **UI:** A small verification card added to `/settings/mock-outbox`.
- **Tests:** `connector-send-contract.test.ts` covering 15 specific safety cases.

## Future Real-Send Preconditions
Before real sending occurs in later phases, the following must be true:
1. `canSendRealNow` flag is officially flipped to `true`.
2. A real production worker is spun up to consume the `ZaloOutboxMessage` queue.
3. Connector APIs are successfully mocked/integrated with throttling logic.

## Connector Request Contract
Every send attempt must provide:
- `tenantId` & `actorUserId`
- `channel` & `connectorAccountId`
- `draftId` & `recipientId`
- `approvalStatus` (must be `APPROVED_FOR_MANUAL_USE`)
- `idempotencyKey`

## Idempotency Rules
The idempotency key is strictly verified. If it is missing, the transition is `BLOCKED_BY_MISSING_IDEMPOTENCY`. This prevents double-sending the same draft to the same recipient in the same channel.

## Audit Metadata Rules
Audit metadata is generated safely as `auditPreviewMetadata`.
- It **never** contains the raw message body.
- It **redacts** phone numbers, OTPs, API keys, passwords, and tokens.
- It **never** includes connector secrets.

## RBAC/Role Restrictions
- `OWNER` / `ADMIN` have full access.
- `SALE` can only approve `SALES` or `GENERAL` drafts.
- `TEACHER` can only approve `TEACHER` or `GENERAL` drafts.
- `ACCOUNTANT` can only approve `FINANCE` or `GENERAL` drafts.
- Drafts flagged as `HIGH` or `CRITICAL` risk by AI require `OWNER` or `ADMIN` approval, regardless of domain.

## Group Chat Restrictions
If `isGroupChat` is true, the following rules apply:
- **Tuition Reminders**: Blocked. (keywords: học phí, đóng tiền, chuyển khoản, thanh toán).
- **Private Info**: Blocked. (keywords: cá nhân, kết quả học tập riêng).
- **Complaints**: Blocked. (keywords: phàn nàn, khiếu nại).

## Next Phase Recommendation
- **Phase 44 (Outbox Worker Foundation & Final Connector Integration)**: Build the real outbox worker, map the validated contract payload to the actual Zalo/Facebook connector functions, and implement throttling and real database updates (`ZaloOutboxMessage`).
