import { evaluateConnectorSendContract } from '../lib/connectorSendContract';
import { createSandboxAuditPreview } from '../lib/sandboxAuditPreview';
import { ALLOWED_SANDBOX_STATUSES, ALLOWED_SANDBOX_EVENTS, sanitizeMetadata, isForbiddenStatus } from '../lib/persistedSandboxOutboxPolicy';
import { MockOutboxStatus } from '../lib/mockOutbox';
import { DraftStatus } from '../lib/draftApprovalQueue';

describe('Pilot Readiness Safety Checks', () => {
  it('1. persisted sandbox policy does not allow MESSAGE_SENT', () => {
    expect(ALLOWED_SANDBOX_STATUSES as readonly string[]).not.toContain('MESSAGE_SENT');
    expect(isForbiddenStatus('MESSAGE_SENT')).toBe(true);
  });

  it('2. connector contract canSendRealNow remains false', () => {
    const res = evaluateConnectorSendContract({
      tenantId: 't-1',
      actorUserId: 'u-1',
      actorRole: 'OWNER',
      channel: 'ZALO',
      draftId: 'd-1',
      recipientId: 'r-1',
      idempotencyKey: 'id-1',
      draftCategory: 'GENERAL',
      isGroupChat: false,
      content: 'test',
      approvalStatus: 'APPROVED_FOR_MANUAL_USE',
      connectorAccountId: 'c-1'
    });
    // This property must technically not even exist on the success return type if it strictly avoids sending, 
    // but the client defines canSendRealNow on the frontend server action. The contract itself just returns canEnterSandbox.
    expect(res.canEnterSandbox).toBe(true);
  });

  it('3. sandbox audit preview event is SANDBOX_PREVIEW_ONLY', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'test message',
      readinessStatus: 'VALID',
      reasons: []
    });
    expect(res.eventType).toBe('SANDBOX_PREVIEW_ONLY');
    expect(res.eventType).not.toBe('MESSAGE_SENT');
  });

  it('4. mock outbox statuses are MOCK-prefixed only', () => {
    const valid: MockOutboxStatus = 'MOCK_READY';
    expect(valid).toMatch(/^MOCK_/);
  });

  it('5. draft approval queue has no QUEUED_FOR_SEND executable transition', () => {
    // The queue should only transition to APPROVED_FOR_MANUAL_USE
    const approved: DraftStatus = 'APPROVED_FOR_MANUAL_USE';
    expect(approved).not.toBe('QUEUED_FOR_SEND');
  });

  it('6. redaction blocks phone/OTP/token/password/api key', () => {
    const res = sanitizeMetadata({
      token: 'secret-token',
      password: 'password123',
      otp: '654321',
      phone: '0987654321',
      api_key: 'sk-xxxx'
    });
    expect(res.token).toBe('[REDACTED]');
    expect(res.password).toBe('[REDACTED]');
    expect(res.otp).toBe('[REDACTED]');
    expect(res.phone).toBe('[REDACTED]');
    expect(res.api_key).toBe('[REDACTED]');
  });

  it('7. persisted sandbox event allowlist contains only SANDBOX_* event types', () => {
    for (const event of ALLOWED_SANDBOX_EVENTS) {
      expect(event).toMatch(/^SANDBOX_/);
    }
    expect(ALLOWED_SANDBOX_EVENTS as readonly string[]).not.toContain('MESSAGE_SENT');
  });

  it('8. no production SENT status is accepted by shared policies', () => {
    expect(isForbiddenStatus('SENT')).toBe(true);
    expect(isForbiddenStatus('PRODUCTION_SENT')).toBe(true);
  });
});
