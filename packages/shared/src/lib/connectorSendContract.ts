import { checkMessageQuality, MessageQualityResult } from './messageQualityGuardrails';
import { UserRole } from './rbac';
import { redactSensitiveInfo } from './timelineBuilder';

export type ConnectorChannel = "ZALO" | "FANPAGE" | "SMS" | "EMAIL";
export type ConnectorSendMode = "CONTRACT_ONLY" | "SANDBOX_ONLY";

export type ConnectorSendReadinessStatus =
  | 'NOT_READY'
  | 'READY_FOR_SANDBOX'
  | 'BLOCKED_BY_GUARDRAIL'
  | 'BLOCKED_BY_PERMISSION'
  | 'BLOCKED_BY_MISSING_IDEMPOTENCY'
  | 'BLOCKED_BY_MISSING_RECIPIENT'
  | 'BLOCKED_BY_UNSAFE_CONTENT'
  | 'BLOCKED_BY_GROUP_CHAT_POLICY'
  | 'BLOCKED_BY_CONNECTOR_SCOPE';

export interface ConnectorSendContractInput {
  tenantId: string;
  actorUserId: string;
  actorRole: UserRole;
  channel: ConnectorChannel;
  draftId: string;
  recipientId: string;
  idempotencyKey: string;
  draftCategory: 'SALES' | 'TEACHER' | 'FINANCE' | 'GENERAL';
  isGroupChat?: boolean;
  content: string;
  approvalStatus: 'PENDING_REVIEW' | 'APPROVED_FOR_MANUAL_USE' | 'CANCELLED';
  connectorAccountId: string;
}

export interface ConnectorSendContractResult {
  readinessStatus: ConnectorSendReadinessStatus;
  canEnterSandbox: boolean;
  canSendRealNow: boolean; // Always false in Phase 43
  reasons: string[];
  safeSummary: string;
  auditPreviewMetadata: any;
}

export function evaluateConnectorSendContract(input: ConnectorSendContractInput): ConnectorSendContractResult {
  const reasons: string[] = [];
  let readinessStatus: ConnectorSendReadinessStatus = 'READY_FOR_SANDBOX';
  const safeSummary = redactSensitiveInfo(input.content);

  // 1. Mandatory base fields
  if (!input.tenantId || !input.actorUserId || !input.connectorAccountId || !input.draftId) {
    readinessStatus = 'NOT_READY';
    reasons.push('Thiếu thông tin hệ thống bắt buộc (tenantId, actorUserId, connectorAccountId, draftId).');
  }

  if (!input.idempotencyKey) {
    readinessStatus = 'BLOCKED_BY_MISSING_IDEMPOTENCY';
    reasons.push('Thiếu Idempotency Key (chống gửi trùng lặp).');
  }

  if (!input.recipientId) {
    readinessStatus = 'BLOCKED_BY_MISSING_RECIPIENT';
    reasons.push('Không có người nhận.');
  }

  // 2. Approval status
  if (input.approvalStatus !== 'APPROVED_FOR_MANUAL_USE') {
    readinessStatus = 'NOT_READY';
    reasons.push('Nháp chưa được phê duyệt.');
  }

  // 3. RBAC Domain Check
  if (input.actorRole !== 'OWNER' && input.actorRole !== 'ADMIN') {
    if (input.actorRole === 'SALE' && input.draftCategory !== 'SALES' && input.draftCategory !== 'GENERAL') {
      readinessStatus = 'BLOCKED_BY_PERMISSION';
      reasons.push('SALE không được gửi tin nhắn thuộc phạm vi khác (ví dụ FINANCE/TEACHER).');
    }
    if (input.actorRole === 'TEACHER' && input.draftCategory !== 'TEACHER' && input.draftCategory !== 'GENERAL') {
      readinessStatus = 'BLOCKED_BY_PERMISSION';
      reasons.push('TEACHER không được gửi tin nhắn thuộc phạm vi khác (ví dụ SALES/FINANCE).');
    }
    if (input.actorRole === 'ACCOUNTANT' && input.draftCategory !== 'FINANCE' && input.draftCategory !== 'GENERAL') {
      readinessStatus = 'BLOCKED_BY_PERMISSION';
      reasons.push('ACCOUNTANT không được gửi tin nhắn thuộc phạm vi khác (ví dụ SALES/TEACHER).');
    }
  }

  // 4. Guardrails (AI Content Safety)
  const quality = checkMessageQuality({
    message: input.content,
    channel: input.channel === 'ZALO' ? 'ZALO' : 'FANPAGE', // Simplify for guardrail
    audience: input.isGroupChat ? 'STUDENT' : 'PARENT', // Rough proxy
    staffRole: input.actorRole
  });

  if (quality.status === 'BLOCKED') {
    readinessStatus = 'BLOCKED_BY_GUARDRAIL';
    reasons.push('Nội dung vi phạm chính sách kiểm duyệt nghiêm trọng.');
  }

  if (quality.severity === 'CRITICAL' || quality.severity === 'HIGH') {
    if (input.actorRole !== 'OWNER' && input.actorRole !== 'ADMIN') {
      readinessStatus = 'BLOCKED_BY_PERMISSION';
      reasons.push('Tin nhắn rủi ro cao/nghiêm trọng cần OWNER/ADMIN phê duyệt.');
    }
  }

  // 5. Group Chat Policy
  if (input.isGroupChat) {
    const lowerContent = input.content.toLowerCase();
    const hasTuitionInfo = lowerContent.includes('học phí') || lowerContent.includes('đóng tiền') || lowerContent.includes('chuyển khoản') || lowerContent.includes('thanh toán');
    const hasPrivateInfo = lowerContent.includes('cá nhân') || lowerContent.includes('kết quả học tập riêng');
    const hasComplaint = lowerContent.includes('phàn nàn') || lowerContent.includes('khiếu nại');

    if (hasTuitionInfo) {
      readinessStatus = 'BLOCKED_BY_GROUP_CHAT_POLICY';
      reasons.push('Không được gửi nhắc nợ học phí vào group chat.');
    }
    if (hasPrivateInfo || hasComplaint) {
      readinessStatus = 'BLOCKED_BY_GROUP_CHAT_POLICY';
      reasons.push('Không được gửi thông tin cá nhân/nhạy cảm vào group chat chung.');
    }
  }

  const canEnterSandbox = readinessStatus === 'READY_FOR_SANDBOX';

  return {
    readinessStatus,
    canEnterSandbox,
    canSendRealNow: false, // ALWAYS false in Phase 43
    reasons,
    safeSummary,
    auditPreviewMetadata: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      channel: input.channel,
      recipientId: input.recipientId,
      idempotencyKey: input.idempotencyKey,
      readinessStatus,
      reasons,
      safeSummary,
      // Intentionally omitting raw content, phone numbers, connector secrets.
    }
  };
}
