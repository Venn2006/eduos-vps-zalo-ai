# Phase 14 Audit Log Plan

## 1. Existing Model
The `AuditLog` model already exists in `packages/db/prisma/schema.prisma` with the following structure:
```prisma
model AuditLog {
  id           String   @id @default(cuid())
  tenantId     String
  actorId      String?
  entityType   String
  entityId     String
  action       String
  beforeJson   String?  @db.Text
  afterJson    String?  @db.Text
  metadataJson String?  @db.Text
  createdAt    DateTime @default(now())

  @@index([tenantId, entityType, entityId])
}
```

## 2. Event Types
We plan to introduce the following standardized `action` strings for key events:
* `SALES_CALL_OUTCOME_LOGGED`
* `FOLLOW_UP_TASK_CREATED`
* `TRIAL_BOOKING_CREATED`
* `AI_DRAFT_CREATED`
* `AI_DRAFT_APPROVED`
* `MESSAGE_SENT`
* `PAYMENT_UPDATED`
* `PERMISSION_CHANGED`

## 3. Future Implementation Plan
* Create a robust internal logger service (e.g., `auditLogHelper.ts`) to centralize insertions.
* Wrap all sensitive `prisma.$transaction` calls with an `AuditLog.create`.
* Build an `/settings/audit-log` viewer UI for OWNER/ADMIN to query and filter events by actor, entity type, and date range.
* Ensure AI Center actions (draft creation and approval) are thoroughly audited for safety compliance.
