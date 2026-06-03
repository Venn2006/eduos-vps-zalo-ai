"use server";

import { evaluateConnectorSendContract, ConnectorSendContractInput } from "@eduos/shared/src/lib/connectorSendContract";
import { createSandboxAuditPreview, SandboxAuditPreviewMetadata } from "@eduos/shared/src/lib/sandboxAuditPreview";
import { 
  SandboxStatus, 
  ALLOWED_SANDBOX_STATUSES, 
  isValidSandboxTransition, 
  sanitizeMetadata, 
  SandboxEventType 
} from "@eduos/shared/src/lib/persistedSandboxOutboxPolicy";
import { prisma } from "@eduos/db";

export type PreviewSandboxSendReadinessResult = {
  readinessStatus: string;
  canEnterSandbox: boolean;
  canSendRealNow: boolean;
  reasons: string[];
  safeSummary: string;
  auditPreviewMetadata: SandboxAuditPreviewMetadata | null;
  uiLabel: string;
  uiDescription: string;
};

export async function previewSandboxSendReadiness(input: any): Promise<PreviewSandboxSendReadinessResult> {
  const safeInput: ConnectorSendContractInput = {
    tenantId: "server-tenant-id",
    actorUserId: "server-actor-id",
    actorRole: "OWNER",
    channel: input.channel || "ZALO",
    draftId: input.draftId || "mock-draft-id",
    recipientId: input.recipientId || "mock-recipient-id",
    idempotencyKey: input.idempotencyKey || "mock-idempotency",
    draftCategory: input.draftCategory || "GENERAL",
    isGroupChat: !!input.isGroupChat,
    content: input.content || "",
    approvalStatus: input.approvalStatus || "APPROVED_FOR_MANUAL_USE",
    connectorAccountId: "server-connector-account-id"
  };

  const contractResult = evaluateConnectorSendContract(safeInput);
  
  const preview = createSandboxAuditPreview({
    tenantId: safeInput.tenantId,
    actorUserId: safeInput.actorUserId,
    channel: safeInput.channel,
    rawMessage: safeInput.content,
    readinessStatus: contractResult.readinessStatus,
    reasons: contractResult.reasons
  });

  return {
    readinessStatus: contractResult.readinessStatus,
    canEnterSandbox: contractResult.canEnterSandbox,
    canSendRealNow: false, // ALWAYS false
    reasons: contractResult.reasons,
    safeSummary: contractResult.safeSummary,
    auditPreviewMetadata: preview,
    uiLabel: contractResult.canEnterSandbox ? "Hợp lệ cho Sandbox" : "Bị chặn",
    uiDescription: "Kiểm tra phía server hoàn tất. Không gọi connector thực."
  };
}

export async function createSandboxOutboxItem(input: any) {
  const tenantId = "server-tenant-id"; 
  const actorUserId = "server-actor-id";
  const actorRole = "OWNER";
  
  const idempotencyKey = String(input.idempotencyKey || `mock_${Date.now()}`);
  const channel = String(input.channel || 'ZALO');
  const safeSummary = String(input.messageSafeSummary || 'Mock Summary');

  try {
    // Attempt DB creation
    const existing = await prisma.sandboxOutboxItem.findUnique({
      where: {
        tenantId_idempotencyKey: {
          tenantId,
          idempotencyKey
        }
      }
    });

    if (existing) {
      return { success: true, item: existing, fallback: false };
    }

    const item = await prisma.sandboxOutboxItem.create({
      data: {
        tenantId,
        idempotencyKey,
        channel,
        sourceType: 'TEST',
        recipientType: 'USER',
        recipientId: 'mock-recipient',
        messageSafeSummary: safeSummary,
        status: 'MOCK_READY',
        readinessStatus: 'TEST',
        events: {
          create: {
            tenantId,
            eventType: 'SANDBOX_OUTBOX_ITEM_CREATED',
            safeSummary: 'Created in sandbox',
            actorUserId,
            actorRole,
            metadataJson: sanitizeMetadata(input.metadata)
          }
        }
      }
    });
    
    return { success: true, item, fallback: false };
  } catch (e: any) {
    console.warn("DB Create failed, falling back to local mock", e.message);
    return { 
      success: true, 
      item: {
        id: `local_${Date.now()}`,
        idempotencyKey,
        status: 'MOCK_READY',
        messageSafeSummary: safeSummary
      }, 
      fallback: true 
    };
  }
}

export async function listSandboxOutboxItems() {
  const tenantId = "server-tenant-id";
  
  try {
    const items = await prisma.sandboxOutboxItem.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return { success: true, items, fallback: false };
  } catch (e: any) {
    console.warn("DB List failed, falling back to local mock", e.message);
    return { success: true, items: [], fallback: true };
  }
}

export async function transitionSandboxOutboxItem(id: string, action: string) {
  const tenantId = "server-tenant-id";
  const actorUserId = "server-actor-id";
  const actorRole = "OWNER";

  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.sandboxOutboxItem.findUnique({ where: { id } });
      if (!item) return { success: false, error: 'Not found' };
      if (item.tenantId !== tenantId) return { success: false, error: 'Unauthorized' };

      let nextStatus: SandboxStatus | null = null;
      let eventType: SandboxEventType | null = null;

      if (action === 'QUEUE') {
        nextStatus = 'MOCK_QUEUED';
        eventType = 'SANDBOX_OUTBOX_QUEUED';
      } else if (action === 'START_SEND') {
        nextStatus = 'MOCK_SENDING';
        eventType = 'SANDBOX_OUTBOX_SENDING_SIMULATED';
      } else if (action === 'COMPLETE_SEND') {
        nextStatus = 'MOCK_SENT';
        eventType = 'SANDBOX_OUTBOX_SENT_SIMULATED';
      } else if (action === 'FAIL_SEND') {
        nextStatus = 'MOCK_FAILED';
        eventType = 'SANDBOX_OUTBOX_FAILED_SIMULATED';
      } else if (action === 'CANCEL') {
        nextStatus = 'MOCK_CANCELLED';
        eventType = 'SANDBOX_OUTBOX_CANCELLED';
      } else {
        return { success: false, error: 'Unknown action' };
      }

      if (!isValidSandboxTransition(item.status as SandboxStatus, nextStatus)) {
        return { success: false, error: 'Invalid transition' };
      }

      const updated = await tx.sandboxOutboxItem.update({
        where: { id },
        data: {
          status: nextStatus,
          events: {
            create: {
              tenantId,
              eventType,
              safeSummary: `Transitioned to ${nextStatus}`,
              actorUserId,
              actorRole
            }
          }
        }
      });

      return { success: true, item: updated, fallback: false };
    });
  } catch (e: any) {
    console.warn("DB transition failed, falling back to local transition error", e.message);
    return { success: false, error: 'DB unavailable, please use local fallback in UI', fallback: true };
  }
}
