# Phase 59: Safe Data Pipeline & Connector Architecture Plan

## 1. Context
- EduOS after Phase 58.
- Current system is sandbox-safe.
- CRM, teacher, homework, finance modules now have deterministic demo workflows.
- Future connector/data pipeline must be designed before any real integration.

## 2. Goal
- Define safe data pipeline architecture.
- Prepare for future pilot connectors.
- Keep all current code sandbox/demo-only.

## 3. Data Sources and Allowed Modes

| Data source | Example data | Allowed mode now | Future allowed mode | Consent required? | Risk level | Notes |
|---|---|---|---|---|---|---|
| Zalo OA | Messages, contacts | deterministic mock | official API/webhook | Yes | Medium | Official API only |
| Zalo personal account | Private chats | deterministic mock | disabled | N/A | Prohibited | No scraping allowed |
| Zalo group/class chat | Group messages | deterministic mock | disabled | N/A | Prohibited | No scraping allowed |
| Facebook Fanpage | Messages, comments | deterministic mock | official API/webhook | Yes | Medium | Official API only |
| Landing page/form | Leads | deterministic mock | official API/webhook | Yes | Low | Clean import |
| Manual CSV/XLSX import | Leads, students | deterministic mock | manual import | Yes | Low | Customer-provided |
| Class schedule | Timetables | deterministic mock | manual import | Yes | Low | |
| Attendance | Presence logs | deterministic mock | manual import | Yes | Low | |
| Homework | File submissions | deterministic mock | customer-provided export | Yes | Low | |
| Parent report | Output drafts | deterministic mock | draft-only / teacher approval | Yes | High | |
| Finance/tuition | Debt balances | deterministic mock | admin approval required | Yes | High | |
| VietQR/payment confirmation | Transactions | deterministic mock | sandbox queue | Yes | High | Requires audit |
| Bank/Open Banking | Bank statements | deterministic mock | disabled | N/A | High | Requires pilot |
| Teacher notes | Private comments | deterministic mock | manual import | Yes | Medium | |
| Approval queue | Internal tasks | deterministic mock | sandbox queue | N/A | Low | |
| Mock outbox | Outbound intent | deterministic mock | sandbox queue | N/A | Low | |

Disallowed Modes:
- Scraping behind login
- Credential sharing
- Bypassing rate limits
- Silent/stealth automation
- Real send without approval
- Production worker without explicit pilot approval

## 4. Safe Pipeline Layers

- **Source Adapter Layer**: Purpose: Connects to official APIs. Input: Webhooks/Events. Output: Standardized raw payload. Current: Mocked. Future: Verified webhook endpoints. Safety: Signature verification required.
- **Consent / Tenant Permission Layer**: Purpose: Checks if tenant opted-in. Input: Raw payload. Output: Consent confirmed or rejected. Current: Mocked. Future: DB flag checks. Safety: Drops unauthorized data immediately.
- **Import / Webhook Intake Layer**: Purpose: Fast intake queue. Input: Consented payload. Output: Enqueued task. Current: Sync mock. Future: Redis/SQS. Safety: Rate limits.
- **Validation and Normalization Layer**: Purpose: Cleans data. Input: Queued task. Output: Validated JSON. Current: Mocked. Future: Zod schema parsing. Safety: Drops malformed data.
- **PII Masking / Redaction Layer**: Purpose: Hides sensitive info. Input: Valid JSON. Output: Masked JSON. Current: `[SĐT đã ẩn]`. Future: Regex/NLP masking. Safety: Prevents raw PII from hitting LLM.
- **Context Builder Layer**: Purpose: Prepares AI context. Input: Masked JSON. Output: Conversation thread. Current: Mocked. Future: RAG/DB fetch. Safety: Tenant isolation.
- **Automation Policy Layer**: Purpose: Decides AI autonomy. Input: Thread context. Output: Action intent. Current: Hardcoded `DRAFT_ONLY` / `TEACHER_APPROVAL_REQUIRED`. Future: Tenant settings. Safety: Enforces approval gates.
- **Approval Gate Layer**: Purpose: Human-in-the-loop. Input: Action intent. Output: Approved/Rejected task. Current: UI mock. Future: DB approval state. Safety: Blocks real sends.
- **Sandbox Outbox Layer**: Purpose: Safe staging for sends. Input: Approved task. Output: Saved outbox record. Current: DB mock. Future: Real DB table. Safety: Does not dispatch to real network.
- **Audit Log Layer**: Purpose: Traceability. Input: Any pipeline event. Output: Append-only log. Current: UI mock. Future: Audit DB table. Safety: Immutable tracking.
- **AI Add-on Metering Layer**: Purpose: Billing and quota. Input: Approved task. Output: Token/Usage count. Current: Mocked. Future: Usage DB. Safety: Stops processing if out of quota.

## 5. Context Builder Design

How raw data becomes AI-safe context:
- Deduplicate messages based on provider IDs.
- Normalize timestamps to UTC.
- Classify source channel (Zalo, FB).
- Mask phone numbers before DB/LLM insertion.
- Remove secrets or tokens.
- Map student/parent/lead identifiers deterministically.
- Preserve audit trail linking to original raw payload hash.
- Summarize long conversations to save tokens.
- Attach workflow status.
- Attach approval requirement flag.

*Note: In current demo, this is deterministic/mock only. No live LLM context injection is implemented. No real private messages are processed.*

## 6. Automation Safety Modes

- **FAQ/simple info**: `AUTO_LOW_RISK`
- **Lead follow-up**: `AUTO_WITH_DASHBOARD_REPORT`
- **Complaint/refund/policy**: `STAFF_HANDOFF`
- **Homework grading**: `TEACHER_APPROVAL_REQUIRED`
- **Parent report**: `TEACHER_APPROVAL_REQUIRED`
- **Tuition reminder**: `ADMIN_APPROVAL_REQUIRED` / `DRAFT_ONLY`
- **Payment/debt**: `ADMIN_APPROVAL_REQUIRED`
- **Social post**: `DRAFT_ONLY`
- **Real send**: Off (currently disabled system-wide)

Money-related communication = `ADMIN_APPROVAL_REQUIRED` or `DRAFT_ONLY`.
Homework/grade/report = `TEACHER_APPROVAL_REQUIRED`.
Social post = `DRAFT_ONLY`.
Connector disabled = OFF.
Real send remains disabled.

## 7. Audit Log Requirements

Required fields:
- `tenantId`
- `actorType`
- `actorId`
- `source`
- `eventType`
- `originalPayloadHash`
- `normalizedPayloadHash`
- `automationMode`
- `approvalStatus`
- `reviewedBy`
- `timestamp`
- `outboxId` (if any)
- `sendStatus` (always sandbox/mock until future approval)
- `errorReason`
- `dataRetentionTag`

(This is architecture/spec only, no DB schema is implemented.)

## 8. Queue and Worker Policy

Future queue design:
- Rate-limit-aware queue
- Idempotency key
- Retry policy
- Dead-letter queue
- Tenant isolation
- Manual replay
- Circuit breaker
- Dry-run mode
- Sandbox mode

Hard rule:
- Do not create production worker now.
- Do not implement queue now.
- Do not add real send now.

## 9. Data Privacy and Consent

- Tenant opt-in required per channel.
- Role-based access to imported data.
- Parent/student privacy prioritized.
- Masking phone numbers.
- No raw credential storage.
- No scraping private chat.
- No exporting private data without consent.
- Data retention policy (TBD based on legal constraints).
- Deletion process concept (soft vs hard delete).

## 10. Current vs Future State

| Phase | Description |
|---|---|
| **Current demo state** | Mocked, local data, deterministic, no background workers. |
| **First paid pilot readiness** | One channel enabled, read-only import, manual UI review. |
| **Controlled real connector readiness** | Sandbox dry-run, limited pilot tenants, explicit real-send approval. |
| **Production hardening required** | Full queue isolation, circuit breakers, rate limiting, scalable DB. |

## 11. Risks and Mitigations

Risks:
- accidental real send
- credential misuse
- private scraping
- poor consent handling
- stale data
- duplicate message import
- wrong AI suggestion
- payment misclassification
- teacher/parent trust issue

Mitigations:
- approval gates
- sandbox outbox
- audit log
- mock-first
- dry-run mode
- scoped pilots
- explicit enable flags
- tenant-by-tenant rollout

## 12. Manual QA / Review Checklist

For future connector work:
- [ ] Has the tenant opted in?
- [ ] Is the data source using official APIs?
- [ ] Are phone numbers masked?
- [ ] Does it require Admin/Teacher approval?
- [ ] Is real send disabled by default?
- [ ] Is the audit log being written to?
