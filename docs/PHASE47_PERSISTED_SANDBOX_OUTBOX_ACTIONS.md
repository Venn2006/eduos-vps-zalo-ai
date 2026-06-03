# Phase 47: Persisted Sandbox Outbox Actions

## Objective
Use the new `SandboxOutboxItem` and `SandboxOutboxEvent` models to persist sandbox/mock outbox items and sandbox events. 

This phase is **strictly sandbox-only**. It maintains local dev flexibility by gracefully falling back to memory if the database migration hasn't been applied yet. 

## Strict Rules Upheld
* **No external API calls.**
* **No db push** (The db connection relies on manual schema creation in previous phases).
* **No production migrations applied.**
* **No live LLM calls.**
* **No connector send behavior.**
* **No `MESSAGE_SENT` events emitted.**
* **No production worker implementation.**

## Server Actions Added
The following server actions were added in `apps/web/src/app/settings/mock-outbox/actions.ts`:
* `createSandboxOutboxItem`: Safely creates a `SandboxOutboxItem` and initial `SandboxOutboxEvent` (`SANDBOX_OUTBOX_ITEM_CREATED`). Relies on idempotency key to prevent duplicates.
* `listSandboxOutboxItems`: Lists the 50 most recent sandbox outbox items for the server-derived tenant.
* `transitionSandboxOutboxItem`: Performs state transitions (e.g. `MOCK_READY` -> `MOCK_QUEUED`) while strictly verifying transition validity against a strict policy.

### Idempotency Behavior
- **Unique Constraint:** `[tenantId, idempotencyKey]`
- **Action:** If a `createSandboxOutboxItem` request provides an idempotency key that already exists, the server returns the existing item without duplicating the record. 
- Retries will safely return the original item.

## UI Changes
The `/settings/mock-outbox` UI in `apps/web/src/app/settings/mock-outbox/MockOutboxClient.tsx` has been updated:
* Added a database connectivity status indicator.
  * If the DB connection succeeds, it displays **"Sandbox persisted"** (Green).
  * If the DB is unavailable or lacks the new tables, it falls back to a mocked state array and displays **"Bản demo cục bộ — chưa ghi DB"** (Yellow).
* Implemented a "Tạo sandbox item" button to create new sandbox records.
* Retained existing mock transition buttons (e.g. Xếp hàng giả lập, Chạy gửi giả lập) which now use the Server Actions to transition database records.
* Explicitly states that the actions are mocked: "Không tạo MESSAGE_SENT, Không gọi connector."

## DB Models Used
* `SandboxOutboxItem`
* `SandboxOutboxEvent`

## Sandbox Configuration

### Permitted Statuses
* `MOCK_READY`
* `MOCK_QUEUED`
* `MOCK_SENDING`
* `MOCK_SENT`
* `MOCK_FAILED`
* `MOCK_CANCELLED`

### Permitted Event Types
* `SANDBOX_OUTBOX_ITEM_CREATED`
* `SANDBOX_OUTBOX_QUEUED`
* `SANDBOX_OUTBOX_SENDING_SIMULATED`
* `SANDBOX_OUTBOX_SENT_SIMULATED`
* `SANDBOX_OUTBOX_FAILED_SIMULATED`
* `SANDBOX_OUTBOX_CANCELLED`
* `SANDBOX_PREVIEW_ONLY`

## Fallback Behavior
If Prisma fails (e.g. because the new tables don't exist locally), the Server Actions gracefully catch the error, log a warning, and return `fallback: true` with mocked objects. The client UI detects this flag and uses React state arrays to simulate the outbox behavior without completely breaking the Settings page.

## Migration Application Assumptions
Because Prisma `db push` or `migrate dev` cannot be run automatically in this environment without disrupting production, the tables must be manually generated or migrated later. Thus, the system treats `SandboxOutboxItem` interactions as optionally persisted during this phase.

## Known Limitations
* Since tenant and user sessions aren't fully mocked on the client yet, the Server Actions hardcode the `tenantId` to `"server-tenant-id"` and `actorUserId` to `"server-actor-id"` for safety. This prevents arbitrary client impersonation.

## Next Phase Recommendation
Phase 48 should focus on refining the Sandbox Outbox Worker simulation — creating an in-memory queue processor that automatically transitions `MOCK_QUEUED` to `MOCK_SENDING` and then to a final state, testing concurrency without touching the real connector.
