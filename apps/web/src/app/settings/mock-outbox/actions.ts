"use server";

import { evaluateConnectorSendContract, ConnectorSendContractInput } from "@eduos/shared/src/lib/connectorSendContract";
import { createSandboxAuditPreview, SandboxAuditPreviewMetadata } from "@eduos/shared/src/lib/sandboxAuditPreview";

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
  // In a real server action, we would extract tenantId, actorUserId, actorRole from the session.
  // We explicitly DO NOT trust client inputs for these in production.
  // For this sandbox preview, we mock the session values safely.
  
  const safeInput: ConnectorSendContractInput = {
    tenantId: "server-tenant-id",
    actorUserId: "server-actor-id",
    actorRole: "OWNER", // Assume OWNER for sandbox testing
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
