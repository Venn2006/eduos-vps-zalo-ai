# Phase 45 — Persisted Sandbox Outbox Schema Plan + Migration Review Plan

## Objective
Plan the future database persistence layer for sandbox/mock outbox items without creating or applying schema changes yet. This phase is planning-only. It establishes the foundations for safely migrating our in-memory Sandbox into a persisted database queue, while strictly maintaining guardrails against accidental production sends.

## 1. Current Safe State
- **Approval queue is manual-review-only**: The system requires human approval (CEO/Manager) before a draft transitions from `PENDING_REVIEW` to `APPROVED_FOR_MANUAL_USE`.
- **Mock outbox is local/sandbox-only**: Currently lives only in memory (React state) and `mockOutbox.ts` logic. It does not write to the DB.
- **Connector contract `canSendRealNow` always false**: The contract evaluation in `evaluateConnectorSendContract` strictly overrides and prevents any real delivery intent.
- **Server sandbox audit preview does not write DB**: The server action `previewSandboxSendReadiness` produces an Audit Preview Metadata object and returns it to the client, without persisting to `AuditLog`.
- **No real send exists**: There is no production worker processing items, and no code executing external API calls (e.g., Zalo/Facebook).

## 2. Proposed Future Schema
*Note: Do not edit schema.prisma in Phase 45.*

### Proposed Model: `SandboxOutboxItem`
This table represents messages queued for sandbox processing.
Suggested fields:
- `id`: String @id @default(cuid())
- `tenantId`: String (required for isolation)
- `draftId`: String
- `sourceType`: String (e.g., "MANUAL_APPROVAL", "AUTOMATION_PREVIEW")
- `sourceId`: String?
- `channel`: String ("ZALO" | "FANPAGE" | "SMS" | "EMAIL")
- `connectorAccountId`: String
- `recipientType`: String
- `recipientId`: String
- `recipientSafeLabel`: String
- `messageSafeSummary`: String
- `messageBodyEncrypted` or `messageBodyRef`: ONLY as future option (do not store raw private bodies in cleartext)
- `idempotencyKey`: String
- `status`: String
- `readinessStatus`: String
- `guardrailStatus`: String
- `approvalStatus`: String
- `riskLevel`: String
- `attemptCount`: Int @default(0)
- `maxAttempts`: Int @default(3)
- `lastAttemptAt`: DateTime?
- `nextAttemptAt`: DateTime?
- `failureReason`: String?
- `createdByUserId`: String
- `approvedByUserId`: String
- `cancelledByUserId`: String?
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime @updatedAt
- `queuedAt`: DateTime?
- `sandboxSentAt`: DateTime?
- `cancelledAt`: DateTime?

**Important Security Constraints:**
- For the sandbox phase, use `MOCK_*` statuses only.
- **Do not use production `SENT` without `MOCK` prefix.**
- **No connector secret fields.**
- **No phone/OTP/token/password/api key in safe summary.**

### Possible Model: `SandboxOutboxEvent`
This table records audit trails for sandbox outbox transitions.
Suggested fields:
- `id`: String @id @default(cuid())
- `tenantId`: String
- `sandboxOutboxItemId`: String
- `eventType`: String
- `safeSummary`: String
- `metadataJson`: Json
- `actorUserId`: String
- `actorRole`: String
- `createdAt`: DateTime @default(now())

**Important Security Constraints:**
- `eventType` must use `SANDBOX_*` names.
- **No `MESSAGE_SENT`.**
- `metadataJson` must be safe and redacted (no secrets/PII).

## 3. Status Design
**Allowed Sandbox Statuses:**
- `MOCK_READY`
- `MOCK_QUEUED`
- `MOCK_SENDING`
- `MOCK_SENT`
- `MOCK_FAILED`
- `MOCK_CANCELLED`

**Forbidden in Sandbox Executable Flow:**
- `SENT`
- `QUEUED_FOR_SEND`
- `MESSAGE_SENT`
- `PRODUCTION_SENT`
- `DELIVERED`

**Why?**
Using explicit `MOCK_` prefixes prevents any background production worker (if ever deployed early) from accidentally picking up a sandbox record. It enforces a strict separation of concerns at the database level. If a query searches for `QUEUED_FOR_SEND`, it will yield 0 results from the sandbox queue.

## 4. Idempotency Plan
- **Unique Constraint**: Ensure a unique composite constraint on `[tenantId, idempotencyKey]`.
- **Server-Derived Key**: The `idempotencyKey` should be constructed server-side (e.g., `hash(tenantId + draftId + recipientId + channel)`).
- **Client Mistrust**: The client cannot supply a trusted idempotency key alone. The server must validate and potentially re-hash it.
- **Duplicate Prevention**: If duplicate queue attempts arrive, the unique constraint will throw. The system should gracefully catch this and return the existing queued item.
- **Retries**: Retries increment `attemptCount` and update `nextAttemptAt` rather than creating duplicate rows.

## 5. Tenant and RBAC Plan
- **Tenant Isolation**: `tenantId` is strictly required on every model.
- **Server-Derived Tenant**: `tenantId` and `actorUserId` must be extracted from the secure session/token, never trusted from the client payload.
- **Role Scopes**:
  - `OWNER`/`ADMIN`: Tenant-wide access.
  - `SALE`: Only assigned sales/lead drafts (`SALES`, `GENERAL`).
  - `TEACHER`: Only academic/class drafts (`ACADEMIC`, `GENERAL`).
  - `ACCOUNTANT`: Only finance drafts (`FINANCE`, `GENERAL`).
  - `UNKNOWN`: Completely blocked.

## 6. Audit Plan
**Sandbox Audit Events (Allowed):**
- `SANDBOX_OUTBOX_ITEM_CREATED`
- `SANDBOX_OUTBOX_QUEUED`
- `SANDBOX_OUTBOX_SENDING_SIMULATED`
- `SANDBOX_OUTBOX_SENT_SIMULATED`
- `SANDBOX_OUTBOX_FAILED_SIMULATED`
- `SANDBOX_OUTBOX_CANCELLED`
- `SANDBOX_PREVIEW_ONLY`

**Forbidden Events:**
- `MESSAGE_SENT`
- `CONNECTOR_DELIVERY_STATUS_UPDATED` (unless mock-prefixed)

**Audit Metadata Rules:**
- Contains safe summary only.
- No raw private body text.
- No connector secrets.
- No phone, OTP, token, password, or API keys.

## 7. Migration Review Plan
The future migration must adhere to a strict and safe review process:
1. Create a feature branch.
2. Inspect `schema.prisma` and add Prisma models.
3. Run migration with `--create-only` flag (`prisma migrate dev --create-only`).
4. Inspect the generated SQL.
5. Verify no destructive SQL operations (no `DROP TABLE` or column drops for existing models).
6. Do not run `prisma db push` blindly.
7. Run `typecheck`, `build`, and `test`.
8. Seed demo data only if it is marked safe/mocked.
9. Merge into `master` only after SQL review is approved.

## 8. Future Implementation Phases
**Phase 46 — Sandbox Outbox Schema Migration Create-Only**
- Propose schema edits.
- Create migration using `--create-only`.
- Inspect generated SQL manually.
- Do not apply to production blindly.

**Phase 47 — Persisted Sandbox Outbox UI + Server Actions**
- Create/read/update operations for sandbox items.
- DB writes are allowed only after migration approval.
- Still no real send.

**Phase 48 — Production Outbox Architecture + Connector Isolation**
- Design the production send table and the actual background worker.
- Still no live send unless explicitly approved by safety guardrails.

**Phase 49 — Limited Real Send Pilot**
- Proceed only after audit, idempotency, RBAC, and connector isolation are fully proven.
- Limited to specific tenant, specific channel, and manual approval only.

## 9. Go / No-Go Checklist
Before it is safe to implement this schema, verify:
- [ ] Models are reviewed.
- [ ] Generated SQL is reviewed.
- [ ] Indexes (e.g., on status, tenantId) are reviewed.
- [ ] Unique constraint (`tenantId` + `idempotencyKey`) is reviewed.
- [ ] Tenant isolation logic is reviewed.
- [ ] No secrets are being persisted in plain text in the DB.
- [ ] No production send worker can access these tables.
- [ ] Rollback plan exists.

## 10. What Phase 45 must NOT do
- No `schema.prisma` edits.
- No migration creation.
- No `db push`.
- No DB writes.
- No external API calls.
- No connector send executions.
- No `MESSAGE_SENT` emissions.
- No production worker creation.
