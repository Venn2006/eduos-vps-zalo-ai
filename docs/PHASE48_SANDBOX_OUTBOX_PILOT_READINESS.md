# Phase 48: Sandbox Outbox QA & First Pilot Readiness

## Objective
Harden the persisted sandbox outbox workflow and rigorously prepare EduOS for a paid pilot demo. This phase verifies that the system can safely guide users through the complete message AI intelligence pipeline without inadvertently firing real API connector calls. 

## End-to-End Demo Flow
1. **CEO Dashboard:** Surfaces conversational risks or AI-suggested follow-ups.
2. **AI Conversation Intelligence / Inbox:** Identifies intent and flags it for handoff or AI reply.
3. **Guardrail Check:** Ensures AI responses contain no secrets (PII, tokens) and match communication policies.
4. **Approval Queue:** Manually queues AI drafts for human review. Only transitions to `APPROVED_FOR_MANUAL_USE`.
5. **Mock Outbox:** Simulates outbound dispatch. Items are sent to the `SandboxOutboxItem` table instead of a real messaging connector.
6. **Connector Contract & Audit Preview:** Runs safety checks before simulation, confirming the message is properly scoped and safe to simulate.
7. **Persisted Sandbox Outbox:** Tracks the simulated message lifecycle (`MOCK_QUEUED`, `MOCK_SENDING`, `MOCK_SENT`).

## Pilot Setup Checklist
- [x] Run `npx prisma generate` locally before the demo if using DB.
- [x] Ensure fallback mode handles missing DB tables gracefully.
- [x] Create mock data in Approval Queue and Mock Outbox for visual walkthroughs.

## Safe to Demo
* AI Center insights (Conversation Intelligence).
* Fanpage and Zalo inbox interfaces (read-only / local mock behavior).
* The human review process in the Approval Queue.
* The Persisted Sandbox Outbox UI showing how messages are staged and verified.

## Not Production Ready
* **Real Send Capabilities:** Connector dispatch logic is completely disabled and replaced with simulated server actions.
* **Production Worker:** The system uses click-to-transition buttons in the Sandbox Outbox instead of an asynchronous RabbitMQ/Redis worker.
* **Production Statuses:** Statuses like `MESSAGE_SENT`, `DELIVERED`, and `QUEUED_FOR_SEND` are intentionally missing or blocked.

## Controlled Migration Application
The tables `SandboxOutboxItem` and `SandboxOutboxEvent` have not been pushed to a remote production database yet to prevent unintended state drift. When running the demo, the presenter must either manually apply the migration to their local SQL server, or rely on the in-memory fallback feature implemented in Phase 47.

## Safety & Compliance Checklists
### Safety
- [x] No `fetch` or external API calls are executed during the outbound simulation.
- [x] The UI explicitly labels the sandbox (e.g. "Không gửi tới Zalo/Facebook", "Sandbox persisted").

### RBAC (Role-Based Access Control)
- [x] Only `OWNER` / `ADMIN` roles should access `/settings/mock-outbox` and `/settings/audit-log`.
- [x] `SALE` / `TEACHER` / `ACCOUNTANT` cannot force message dispatch.

### PII & Secrets
- [x] Guardrails redact passwords, tokens, API keys, OTPs, and phone numbers before storing them in `safeSummary`.
- [x] Connector secrets are never returned to the client or accepted by the Server Actions.

### No Real Send
- [x] `canSendRealNow` is hardcoded to `false`.
- [x] Event type `MESSAGE_SENT` is blocked via strict typings and runtime checks.

## Known Limitations
The demo relies on explicit manual state transitions (clicking "Đưa vào hàng đợi giả lập", "Chạy gửi giả lập", etc.). A real production environment would process these asynchronously in the background.

## Next Phase Recommendation
Phase 49 should introduce an in-memory background worker simulation to automatically process `MOCK_QUEUED` -> `MOCK_SENDING` -> `MOCK_SENT` without requiring user clicks, mimicking the exact behavior of a real asynchronous worker while remaining fully contained in the sandbox.
