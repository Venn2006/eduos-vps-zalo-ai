import { createSandboxAuditPreview } from '../lib/sandboxAuditPreview';

describe('Sandbox Audit Preview (Phase 44)', () => {
  it('1. preview event uses SANDBOX_PREVIEW_ONLY, not MESSAGE_SENT', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Hello',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    expect(res.eventType).toBe('SANDBOX_PREVIEW_ONLY');
    expect(res.eventType).not.toBe('MESSAGE_SENT');
  });

  it('2. redacts phone', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Gọi tôi qua số 0912345678 nhé',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    expect(res.safeSummary).not.toContain('0912345678');
    expect(res.safeSummary).toContain('[SĐT BẢO MẬT]');
  });

  it('3. redacts OTP/token/password/api key', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Mã OTP là 123456',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    expect(res.safeSummary).not.toContain('123456');
    expect(res.safeSummary).toContain('[BẢO MẬT]');
  });

  it('4. never includes connector secret', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Bí mật hệ thống abcxyz',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    expect(JSON.stringify(res)).not.toContain('secret');
  });

  it('5. never includes raw message body', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Bí mật kinh doanh',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    // metadata does not contain rawMessage
    expect(res.metadata).not.toHaveProperty('rawMessage');
    expect(res.metadata).not.toHaveProperty('rawBody');
  });

  it('6. canSendRealNow is false', () => {
    const res = createSandboxAuditPreview({
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO',
      rawMessage: 'Hello',
      readinessStatus: 'READY_FOR_SANDBOX',
      reasons: []
    });
    expect(res.canSendRealNow).toBe(false);
  });

  it('7. output deterministic', () => {
    const input = {
      tenantId: 't-1',
      actorUserId: 'u-1',
      channel: 'ZALO' as const,
      rawMessage: 'Hello deterministic',
      readinessStatus: 'READY_FOR_SANDBOX' as const,
      reasons: []
    };
    const res1 = createSandboxAuditPreview(input);
    const res2 = createSandboxAuditPreview(input);
    expect(res1).toEqual(res2);
  });
});
