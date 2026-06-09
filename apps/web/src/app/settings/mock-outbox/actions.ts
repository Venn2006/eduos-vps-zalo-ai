"use server";

import {
  evaluateConnectorSendContract,
  ConnectorChannel,
  ConnectorSendContractInput,
} from "@eduos/shared/src/lib/connectorSendContract";
import { createSandboxAuditPreview, SandboxAuditPreviewMetadata } from "@eduos/shared/src/lib/sandboxAuditPreview";
import {
  SandboxStatus,
  isValidSandboxTransition,
  sanitizeMetadata,
  SandboxEventType
} from "@eduos/shared/src/lib/persistedSandboxOutboxPolicy";
import { createAuditLog, prisma } from "@eduos/db";
import { requireRole } from "@/lib/auth";

const AUTHENTICATED_ROLES = ['OWNER', 'ADMIN', 'SALE', 'TEACHER', 'ACCOUNTANT'] as const;

type SandboxReadinessInput = {
  channel?: string;
  draftId?: string;
  recipientId?: string;
  idempotencyKey?: string;
  draftCategory?: string;
  isGroupChat?: boolean;
  content?: string;
  approvalStatus?: string;
};

type CreateSandboxOutboxInput = SandboxReadinessInput & {
  messageSafeSummary?: string;
  metadata?: unknown;
};

const toConnectorChannel = (value?: string): ConnectorChannel => {
  if (value === 'ZALO' || value === 'FANPAGE' || value === 'SMS' || value === 'EMAIL') return value;
  return 'ZALO';
};
const toDraftCategory = (value?: string): ConnectorSendContractInput['draftCategory'] => {
  if (value === 'SALES' || value === 'TEACHER' || value === 'FINANCE' || value === 'GENERAL') return value;
  return 'GENERAL';
};
const toApprovalStatus = (value?: string): ConnectorSendContractInput['approvalStatus'] => {
  if (value === 'PENDING_REVIEW' || value === 'APPROVED_FOR_MANUAL_USE' || value === 'CANCELLED') return value;
  return 'APPROVED_FOR_MANUAL_USE';
};

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

export async function previewSandboxSendReadiness(input: SandboxReadinessInput): Promise<PreviewSandboxSendReadinessResult> {
  const session = await requireRole([...AUTHENTICATED_ROLES]);
  const safeInput: ConnectorSendContractInput = {
    tenantId: session.activeTenantId,
    actorUserId: session.userId,
    actorRole: session.role,
    channel: toConnectorChannel(input.channel),
    draftId: input.draftId || "sandbox-preview-draft",
    recipientId: input.recipientId || "sandbox-preview-recipient",
    idempotencyKey: input.idempotencyKey || "sandbox-preview-idempotency",
    draftCategory: toDraftCategory(input.draftCategory),
    isGroupChat: !!input.isGroupChat,
    content: input.content || "",
    approvalStatus: toApprovalStatus(input.approvalStatus),
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

export async function createSandboxOutboxItem(input: CreateSandboxOutboxInput) {
  const session = await requireRole([...AUTHENTICATED_ROLES]);
  const tenantId = session.activeTenantId;
  const actorUserId = session.userId;
  const actorRole = session.role;

  const idempotencyKey = String(input.idempotencyKey || `sandbox_${Date.now()}`);
  const channel = String(input.channel || 'ZALO');
  const safeSummary = String(input.messageSafeSummary || input.content || 'Sandbox summary');

  const existing = await prisma.sandboxOutboxItem.findUnique({
    where: {
      tenantId_idempotencyKey: {
        tenantId,
        idempotencyKey
      }
    }
  });

  if (existing) {
    return { success: true, item: existing };
  }

  const item = await prisma.sandboxOutboxItem.create({
    data: {
      tenantId,
      idempotencyKey,
      channel,
      sourceType: 'TEST',
      recipientType: 'USER',
      recipientId: input.recipientId || 'sandbox-recipient',
      messageSafeSummary: safeSummary,
      status: 'MOCK_READY',
      readinessStatus: 'TEST',
      createdByUserId: actorUserId,
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

  await createAuditLog(prisma, {
    tenantId,
    actorId: actorUserId,
    action: 'SANDBOX_OUTBOX_ITEM_CREATED',
    entityType: 'SandboxOutboxItem',
    entityId: item.id,
    afterJson: {
      channel: item.channel,
      sourceType: item.sourceType,
      recipientType: item.recipientType,
      status: item.status,
      readinessStatus: item.readinessStatus,
    },
    metadataJson: { source: 'sandbox_outbox_action' },
  });

  return { success: true, item };
}

export async function listSandboxOutboxItems() {
  const session = await requireRole(['OWNER', 'ADMIN']);
  const tenantId = session.activeTenantId;

  const items = await prisma.sandboxOutboxItem.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return { success: true, items };
}

export async function transitionSandboxOutboxItem(id: string, action: string) {
  const session = await requireRole(['OWNER', 'ADMIN']);
  const tenantId = session.activeTenantId;
  const actorUserId = session.userId;
  const actorRole = session.role;

  try {
    const result = await prisma.$transaction(async (tx) => {
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

      return { success: true, item: updated };
    });

    if (result.success && 'item' in result && result.item) {
      await createAuditLog(prisma, {
        tenantId,
        actorId: actorUserId,
        action: 'SANDBOX_OUTBOX_ITEM_TRANSITIONED',
        entityType: 'SandboxOutboxItem',
        entityId: result.item.id,
        afterJson: { status: result.item.status, action },
        metadataJson: { source: 'sandbox_outbox_action' },
      });
    }

    return result;
  } catch (e: unknown) {
    console.error("Sandbox outbox transition failed", e);
    return { success: false, error: 'DB unavailable. Sandbox transition was not saved.' };
  }
}
