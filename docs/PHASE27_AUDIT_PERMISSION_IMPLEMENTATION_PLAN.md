# Phase 27: Audit Log & Dynamic Permission Implementation Plan

## 1. Current State
* **RBAC:** Hardcoded via `canAccessRoute` in `apps/web/src/lib/rbac.ts`.
* **Permission Center UI:** Read-only interface at `/settings/permissions`.
* **Dynamic Overrides:** Not yet supported. Role assignments are rigid (SALE, TEACHER, ACCOUNTANT, ADMIN, OWNER).
* **Audit Logging:** No real `AuditLog` table exists in the database. Actions are only tracked via standard `updatedAt` timestamps on individual tables.

## 2. Proposed Schema Additions
We will introduce three new models to `packages/db/prisma/schema.prisma` in the next phase:
* `AuditLog`
* `PermissionPolicy`
* `PermissionOverride`

### 3. AuditLog Fields
```prisma
model AuditLog {
  id           String   @id @default(cuid())
  tenantId     String
  actorUserId  String
  actorRole    String
  action       String   // e.g., "UPDATE_PAYMENT", "CREATE_CALL_OUTCOME"
  targetType   String   // e.g., "INVOICE", "LEAD"
  targetId     String
  beforeJson   String?  // JSON snapshot before mutation
  afterJson    String?  // JSON snapshot after mutation
  metadataJson String?  // Additional context (e.g., source IP)
  ip           String?
  userAgent    String?
  createdAt    DateTime @default(now())

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  actor        User     @relation(fields: [actorUserId], references: [id], onDelete: Cascade)

  @@index([tenantId, targetType, targetId])
  @@index([tenantId, actorUserId])
}
```

### 4. PermissionPolicy Fields
```prisma
model PermissionPolicy {
  id           String   @id @default(cuid())
  tenantId     String
  role         Role
  module       String   // e.g., "SALES", "FINANCE", "TEACHER"
  canView      Boolean  @default(false)
  canCreate    Boolean  @default(false)
  canUpdate    Boolean  @default(false)
  canApprove   Boolean  @default(false)
  canSend      Boolean  @default(false)
  canExport    Boolean  @default(false)
  canManage    Boolean  @default(false)

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, role, module])
}
```

### 5. PermissionOverride Fields
```prisma
model PermissionOverride {
  id           String   @id @default(cuid())
  tenantId     String
  userId       String
  module       String
  canView      Boolean?
  canCreate    Boolean?
  canUpdate    Boolean?
  canApprove   Boolean?
  canSend      Boolean?
  canExport    Boolean?
  canManage    Boolean?
  expiresAt    DateTime?
  createdBy    String   // Admin who granted this
  reason       String?

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId, module])
}
```

## 6. Rollout Plan
1. **Migration Phase:** Run `npx prisma db push` (or `migrate dev`) in a safe Phase 29.
2. **Seed Defaults:** Write a seed script to populate `PermissionPolicy` with defaults identical to the current hardcoded `ROLE_MATRIX`.
3. **Dual-Read Fallback:** Update `canAccessRoute` to read from DB `PermissionPolicy` first, falling back to the hardcoded matrix if no DB record exists.
4. **UI Update:** Convert `/settings/permissions` from Read-Only to Editable.
5. **Audit Hooking:** Integrate Prisma Middleware or a custom wrapper to automatically generate `AuditLog` rows for every sensitive `prisma.update` / `prisma.create`.
6. **Rollback Plan:** If dynamic permissions cause lockout, administrators can revert by clearing the `PermissionPolicy` table, allowing the hardcoded matrix to take over again.

## 7. First Actions to Audit
* Call outcome logged (`CallAttempt`)
* Follow-up task created (`FollowUpTask`)
* Trial booking created/updated (`TrialBooking`)
* AI prompt submitted (`AiQuery`)
* AI draft approved / Message sent (`ZaloMessage`, `FacebookMessage`)
* Payment changed (`Payment`, `Invoice`)
* Role changed (`TenantMember`)
* Permission changed (`PermissionPolicy`, `PermissionOverride`)
* Connector relogin (`ZaloConnectorSession`)

## 8. Safety & Guardrails
* **Minimize PII:** Do not log sensitive full message bodies in `AuditLog` unless strictly necessary for compliance. Exclude parent/student PII from `beforeJson`/`afterJson` if it is not the mutated field.
* **Tenant Scoping:** All AuditLogs MUST have a `tenantId`.
* **Immutability:** Audit rows cannot be updated or deleted except by automated log-rotation (e.g., > 1 year).
* **Visibility:** Only OWNER/ADMIN can query `AuditLog`.

## 9. Tests Needed
* **Tenant Isolation:** Ensure querying Audit Logs only returns logs for the session's `tenantId`.
* **Role Restrictions:** Non-Admins calling GET `/api/audit` must receive 403 Forbidden.
* **Entry Creation:** Verify that `prisma.payment.create` correctly triggers an `AuditLog` insertion.
* **Dynamic Permission Fallback:** Ensure `canAccessRoute` functions seamlessly if DB rows are missing.
* **Override Priority:** Ensure `PermissionOverride` grants access even if the base `PermissionPolicy` denies it.
