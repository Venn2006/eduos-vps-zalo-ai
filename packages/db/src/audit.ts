import { PrismaClient } from "@prisma/client";

export interface AuditLogPayload {
  tenantId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: any;
  afterJson?: any;
  metadataJson?: any;
}

export async function createAuditLog(prisma: PrismaClient, payload: AuditLogPayload) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        beforeJson: payload.beforeJson ? JSON.stringify(payload.beforeJson) : null,
        afterJson: payload.afterJson ? JSON.stringify(payload.afterJson) : null,
        metadataJson: payload.metadataJson ? JSON.stringify(payload.metadataJson) : null,
      },
    });
  } catch (error) {
    // In production, we might want to use a more robust logging mechanism
    // that doesn't fail the primary transaction.
    console.error("Failed to write audit log", error);
  }
}
