import { evaluateConnectorSendContract, ConnectorSendContractInput } from '../lib/connectorSendContract';

describe('Connector Send Contract & Audit Readiness (Phase 43)', () => {
  const createBaseInput = (): ConnectorSendContractInput => ({
    tenantId: 't-1',
    actorUserId: 'u-1',
    actorRole: 'OWNER',
    channel: 'ZALO',
    draftId: 'd-1',
    recipientId: 'r-1',
    idempotencyKey: 'key-1',
    draftCategory: 'GENERAL',
    isGroupChat: false,
    content: 'Chào bạn, chúc bạn một ngày tốt lành.',
    approvalStatus: 'APPROVED_FOR_MANUAL_USE',
    connectorAccountId: 'acc-1'
  });

  it('1. valid safe approved draft returns READY_FOR_SANDBOX', () => {
    const res = evaluateConnectorSendContract(createBaseInput());
    expect(res.readinessStatus).toBe('READY_FOR_SANDBOX');
    expect(res.canEnterSandbox).toBe(true);
  });

  it('2. canSendRealNow is always false', () => {
    const res = evaluateConnectorSendContract(createBaseInput());
    expect(res.canSendRealNow).toBe(false);
  });

  it('3. missing idempotency key is blocked', () => {
    const input = createBaseInput();
    input.idempotencyKey = '';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_MISSING_IDEMPOTENCY');
    expect(res.canEnterSandbox).toBe(false);
  });

  it('4. missing recipient is blocked', () => {
    const input = createBaseInput();
    input.recipientId = '';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_MISSING_RECIPIENT');
  });

  it('5. BLOCKED guardrail blocks contract', () => {
    const input = createBaseInput();
    input.content = 'Cam kết bao đậu 100%'; // UNREALISTIC_GUARANTEE will trigger CRITICAL -> BLOCKED
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_GUARDRAIL');
  });

  it('6. high/critical risk requires OWNER/ADMIN', () => {
    const input = createBaseInput();
    input.content = 'Không học thì chịu thôi'; // RUDE_OR_TOO_SHORT triggers HIGH risk
    input.actorRole = 'SALE'; // SALE shouldn't approve High risk, needs OWNER/ADMIN
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_PERMISSION');
    expect(res.reasons).toContain('Tin nhắn rủi ro cao/nghiêm trọng cần OWNER/ADMIN phê duyệt.');
  });

  it('7. SALE cannot pass finance draft', () => {
    const input = createBaseInput();
    input.actorRole = 'SALE';
    input.draftCategory = 'FINANCE';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_PERMISSION');
  });

  it('8. TEACHER cannot pass sales draft', () => {
    const input = createBaseInput();
    input.actorRole = 'TEACHER';
    input.draftCategory = 'SALES';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_PERMISSION');
  });

  it('9. ACCOUNTANT cannot pass sales/teacher draft', () => {
    const input = createBaseInput();
    input.actorRole = 'ACCOUNTANT';
    input.draftCategory = 'TEACHER';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_PERMISSION');
  });

  it('10. group tuition reminder is blocked', () => {
    const input = createBaseInput();
    input.isGroupChat = true;
    input.content = 'Nhắc phụ huynh đóng học phí tháng này.';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_GROUP_CHAT_POLICY');
  });

  it('11. private student info in group is blocked', () => {
    const input = createBaseInput();
    input.isGroupChat = true;
    input.content = 'Kết quả học tập riêng của bé A là rất kém.';
    const res = evaluateConnectorSendContract(input);
    expect(res.readinessStatus).toBe('BLOCKED_BY_GROUP_CHAT_POLICY');
  });

  it('12. audit preview metadata redacts phone/OTP/token/password/api key', () => {
    const input = createBaseInput();
    input.content = 'My phone is 0912345678 and OTP is 123456';
    const res = evaluateConnectorSendContract(input);
    const summary = res.auditPreviewMetadata.safeSummary;
    expect(summary).not.toContain('0912345678');
    expect(summary).not.toContain('123456');
    expect(summary).toContain('[SĐT đã ẩn]');
  });

  it('13. connector secret is never included', () => {
    const input = createBaseInput();
    const res = evaluateConnectorSendContract(input);
    expect(JSON.stringify(res.auditPreviewMetadata)).not.toContain('secret');
  });

  it('14. no MESSAGE_SENT event is returned', () => {
    const res = evaluateConnectorSendContract(createBaseInput());
    expect(JSON.stringify(res)).not.toContain('MESSAGE_SENT');
  });

  it('15. output deterministic', () => {
    const input = createBaseInput();
    const res1 = evaluateConnectorSendContract(input);
    const res2 = evaluateConnectorSendContract(input);
    expect(res1).toEqual(res2);
  });
});
