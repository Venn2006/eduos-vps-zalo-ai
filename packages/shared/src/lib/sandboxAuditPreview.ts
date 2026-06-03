import { redactSensitiveInfo } from './timelineBuilder';
import { ConnectorChannel, ConnectorSendReadinessStatus } from './connectorSendContract';

export interface SandboxAuditPreviewInput {
  tenantId: string;
  actorUserId: string;
  channel: ConnectorChannel;
  rawMessage: string;
  readinessStatus: ConnectorSendReadinessStatus;
  reasons: string[];
}

export interface SandboxAuditPreviewMetadata {
  eventType: "SANDBOX_PREVIEW_ONLY";
  safeSummary: string;
  channel: ConnectorChannel;
  readinessStatus: ConnectorSendReadinessStatus;
  canSendRealNow: false;
  metadata: {
    tenantId: string;
    actorUserId: string;
    reasons: string[];
    // rawMessage, rawBody, phone, OTP, token, password, api key, connector secret MUST NOT BE HERE
  };
}

/**
 * Creates safe audit preview metadata without persisting it and without leaking secrets.
 */
export function createSandboxAuditPreview(input: SandboxAuditPreviewInput): SandboxAuditPreviewMetadata {
  // Safe summary in Vietnamese, heavily redacted
  const redactedContent = redactSensitiveInfo(input.rawMessage);
  
  let summaryPrefix = 'Tin nhắn hợp lệ';
  if (input.readinessStatus !== 'READY_FOR_SANDBOX') {
    summaryPrefix = 'Tin nhắn bị chặn';
  }

  return {
    eventType: "SANDBOX_PREVIEW_ONLY",
    safeSummary: `${summaryPrefix}. Nội dung an toàn: "${redactedContent}"`,
    channel: input.channel,
    readinessStatus: input.readinessStatus,
    canSendRealNow: false, // ALWAYS false
    metadata: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      reasons: input.reasons,
    }
  };
}
