# Phase 29: Audit Log Schema Foundation

## 1. Schema Discovery
Upon inspecting the Prisma schema (`packages/db/prisma/schema.prisma`), it was discovered that an `AuditLog` model **already exists** in the database.

Existing Schema:
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

Because this model already fulfills the core requirements for the audit foundation (and is already being used in the codebase within `packages/db/src/audit.ts`, `finance.service.ts`, and `report.service.ts`), **no schema migration was generated or executed**. The existing model perfectly aligns with our safety guidelines and minimizes the risk of breaking existing functionality.

## 2. Fields and Purpose
* `tenantId`: Ensures strict multi-tenant isolation. All logs belong to a single center.
* `actorId`: The `userId` of the person performing the action (optional for system events).
* `entityType`: The type of entity modified (e.g., "LEAD", "PAYMENT").
* `entityId`: The unique identifier of the modified entity.
* `action`: The specific action taken (e.g., "CREATE", "UPDATE", "SALES_CALL_OUTCOME_LOGGED").
* `beforeJson` / `afterJson`: Captures state changes for rollback or historical analysis.
* `metadataJson`: Additional contextual data (e.g., call outcome notes, ip addresses).

## 3. Tenant Isolation
The `@@index([tenantId, entityType, entityId])` explicitly supports rapid, tenant-scoped queries. Every row mandates a `tenantId`.

## 4. What Not to Log
* **Passwords/Secrets:** Never log password hashes or connector tokens.
* **Sensitive PII Bodies:** Avoid dumping full chat histories into the audit log unless it is the explicit target of a metadata change. Limit payloads to the exact fields modified.

## 5. Future Audit Events
In Phase 30, we will integrate this schema to log:
* `SALES_CALL_OUTCOME_LOGGED`
* Trial bookings creation
* Follow-up task creation

## 6. Rollback Plan
Since no migration was necessary, there is nothing to roll back at the schema level.

## 7. DB Push Status
**No production DB push was performed.** The existing structure is being reused safely.
