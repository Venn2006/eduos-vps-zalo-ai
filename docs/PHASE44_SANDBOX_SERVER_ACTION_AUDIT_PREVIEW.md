# Phase 44: Sandbox Server Action & Audit Preview

## Overview
This phase introduces a secure, server-side evaluation step (`previewSandboxSendReadiness`) for the Sandbox. Before we attempt to queue any real message for delivery, the server evaluates the payload through the Connector Send Contract and produces an "Audit Preview" (metadata describing what the audit log *would* look like if this were a real action).

## Added Components
- **Shared Helper**: `packages/shared/src/lib/sandboxAuditPreview.ts` - Creates safe audit preview metadata without persisting it and without leaking secrets.
- **Server Action**: `apps/web/src/app/settings/mock-outbox/actions.ts` - A thin wrapper around the contract evaluation and audit preview generation, simulating a secure backend check.
- **UI Update**: `MockOutboxClient.tsx` - Added a "Kiểm tra server sandbox" card that triggers the server action and displays the results (Audit Preview) without touching real infrastructure.

## Why It Still Does Not Send
The server action hardcodes `canSendRealNow: false`. It intentionally does not call external APIs (Zalo/Facebook), it does not create a `ZaloOutboxMessage` DB record, and it does not emit a `MESSAGE_SENT` event. It only outputs what the system *would* do and the reasons why it might be blocked.

## Audit Preview Behavior
- `eventType` is strictly `SANDBOX_PREVIEW_ONLY`.
- Redacts phone numbers (e.g., `[SĐT BẢO MẬT]`) and sensitive tokens/passwords (e.g., `[BẢO MẬT]`).
- Never includes connector secrets in the metadata payload.
- Never includes the raw message body in the metadata (only a redacted summary).

## Security & Trust Boundaries
- **Server vs Client**: In this sandbox demo, the server action receives mock data. In production, `tenantId`, `actorUserId`, and `actorRole` MUST be derived from the server session, never trusted from the client.
- **No Persistence**: The preview metadata is returned directly to the client for debugging/verification. It is not written to the database.

## Next Phase Recommendation
- **Phase 45 (Real Outbox Worker & DB Integration)**: Now that the server contract and audit preview are proven safe and robust, the next step is to create the actual `ZaloOutboxMessage` schema, persist approved messages to it, and build the background worker to consume the queue and hit the real Zalo APIs (with proper throttling).
