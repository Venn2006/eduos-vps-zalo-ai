-- Speed up tenant-scoped audit log filtering and export.
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_createdAt_idx"
ON "AuditLog" ("tenantId", "createdAt");

CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_action_createdAt_idx"
ON "AuditLog" ("tenantId", "action", "createdAt");
