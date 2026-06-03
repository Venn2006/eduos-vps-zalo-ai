# Phase 17: Zalo & Fanpage Production Hardening Plan

## 1. Current Connector State
* **Zalo Personal VPS Connector:** Currently logs sessions, stores tokens, and can theoretically send via `ZaloOutboxMessage`.
* **Zalo Group Setup Command:** Partially structured but requires strict mapping validations.
* **Zalo Outbox/Status Endpoints:** Exists in schema (`ZaloOutboxMessage`) and CEO Dashboard UI shows counts.
* **Fanpage Webhook:** Configured and receiving messages, generating `FacebookConversation` records.
* **Fanpage Inbox:** UI is live, capable of interacting with the Fanpage Agent.
* **AI Suggestion/Draft Approval Flow:** Implemented strictly as draft generation. Requires explicit human approval before any outbound logic triggers.

## 2. Production Risks
* **Personal Zalo session expiration:** Connections can drop or tokens expire requiring manual re-authentication via QR.
* **Connector offline:** Silent failures if the VPS connector daemon crashes.
* **Duplicate webhook events:** Facebook frequently retries webhooks, risking duplicate replies.
* **Accidental auto-send:** Code paths that skip approval checks.
* **Tenant leakage:** Webhook or API logic improperly attributing messages to the wrong center.
* **Group mapping errors:** Sending Zalo group messages to the wrong Zalo group ID.
* **Stale tokens:** Facebook Page Access Tokens expiring.
* **Missing approval logs:** Approvals occurring without an audit trail indicating *who* approved the send.

## 3. Safe Production Architecture
* **Connector Heartbeat:** Regular pings recorded in `ConnectorHeartbeat` to monitor health.
* **Outbox Queue:** All outgoing messages must be queued in `ZaloOutboxMessage` or similar, rather than synchronous API calls.
* **Approval Queue:** AI drafts must explicitly transition from `PENDING_APPROVAL` to `APPROVED` with user attribution before hitting the Outbox Queue.
* **Retry Policy:** Exponential backoff for outbound messages.
* **Idempotency Key:** Protect against duplicate webhook execution and duplicate outbound sends.
* **Audit Logging:** Record the user ID, timestamp, and context of every message approval.
* **Connector Status UI:** Read-only dashboard for CEOs to monitor connection health.
* **No direct DB access from connector:** The VPS connector should poll an API bridge, never connecting to Postgres directly.
* **API bridge with tenant/RBAC guard:** Secure endpoints for the connector to fetch pending tasks.

## 4. Required Guards
* **No send without explicit approval:** Hard stops in the API layer if a message lacks an approval stamp.
* **Role permission check before approving/sending:** Only OWNER, ADMIN, or explicitly authorized SALE agents can approve.
* **Message templates must be tenant-scoped:** Cannot leak templates across tenants.
* **Webhook signature validation:** Validate `X-Hub-Signature-256` for Fanpage.
* **Event idempotency:** Cache or store processed webhook IDs.
* **Error logging:** Structured logging of all transmission failures.

## 5. Future Implementation Phases
* **Zalo Connector Hardening:** Implementing the API bridge and heartbeat monitoring.
* **Fanpage Send-after-approval:** Wire up the Facebook Send API exclusively to approved `AiActionDraft`s.
* **Message Audit Log:** UI to see history of sent messages.
* **Connector Alerting:** Dashboard notifications when a connector goes offline.
* **Admin Re-login Flow:** Secure UI flow to refresh Zalo sessions via QR code.
