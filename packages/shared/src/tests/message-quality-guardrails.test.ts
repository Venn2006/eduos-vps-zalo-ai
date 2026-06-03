import { checkMessageQuality, GuardrailCheckOptions } from '../lib/messageQualityGuardrails';

describe('messageQualityGuardrails', () => {
  const baseOptions: GuardrailCheckOptions = {
    message: '',
    channel: 'FANPAGE',
    audience: 'PARENT',
    staffRole: 'SALE',
  };

  it('1. safe parent-friendly message returns SAFE', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ em chào anh/chị ạ. Anh chị cho em hỏi bé nhà mình năm nay học lớp mấy rồi để em tư vấn khóa học phù hợp nhé ạ.',
    });
    expect(res.status).toBe('SAFE');
    expect(res.canCopy).toBe(true);
    expect(res.issues).toHaveLength(0);
  });

  it('2. forbidden keyword returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ em chào anh, bên em dạy đảm bảo tuyệt đối ạ.',
      forbiddenKeywords: ['đảm bảo tuyệt đối'],
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.canCopy).toBe(false);
    expect(res.issues.some(i => i.type === 'FORBIDDEN_KEYWORD')).toBe(true);
  });

  it('3. unrealistic guarantee returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Chào anh, bên em bao đậu HSK4 luôn nhé.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.issues.some(i => i.type === 'UNREALISTIC_GUARANTEE')).toBe(true);
    expect(res.suggestedRewrite).toBe('Trung tâm cam kết đồng hành theo lộ trình rõ ràng, theo dõi tiến độ định kỳ và hỗ trợ học viên đạt mục tiêu phù hợp.');
  });

  it('4. rude/too-short message returns NEEDS_REVIEW', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ anh tự tìm hiểu đi nhé.',
    });
    expect(res.status).toBe('NEEDS_REVIEW');
    expect(res.canSendAfterApproval).toBe(true);
    expect(res.issues.some(i => i.type === 'RUDE_OR_TOO_SHORT')).toBe(true);
  });

  it('5. missing greeting or CTA returns NEEDS_REVIEW', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Khóa học này là 2 triệu.',
    });
    expect(res.status).toBe('NEEDS_REVIEW');
    expect(res.issues.some(i => i.type === 'MISSING_GREETING')).toBe(true);
    expect(res.issues.some(i => i.type === 'MISSING_CALL_TO_ACTION')).toBe(true);
  });

  it('6. phone exposure returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ em chào chị, chị gọi em qua số 0912345678 nhé ạ.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.issues.some(i => i.type === 'PHONE_OR_OTP_EXPOSED')).toBe(true);
    expect(res.suggestedRewrite).toContain('[SĐT đã ẩn]');
    expect(res.suggestedRewrite).not.toContain('0912345678');
  });

  it('7. OTP/token/password exposure returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ em chào chị, mật khẩu tài khoản của bé là 123456 nhé ạ.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.issues.some(i => i.type === 'SECRET_OR_TOKEN_EXPOSED')).toBe(true);
    expect(res.suggestedRewrite).toContain('[BẢO MẬT]');
    expect(res.suggestedRewrite).not.toContain('123456');
  });

  it('8. tuition reminder in class group returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      audience: 'CLASS_GROUP',
      message: 'Dạ em chào các phụ huynh, mọi người đóng tiền học phí tháng này giúp em nhé ạ.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.issues.some(i => i.type === 'TUITION_INFO_IN_GROUP_CHAT')).toBe(true);
    expect(res.suggestedRewrite).toBe('Dạ phụ huynh vui lòng check inbox riêng để admin gửi thông tin chi tiết nhé ạ.');
  });

  it('9. private student info in group chat returns BLOCKED', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      audience: 'CLASS_GROUP',
      context: { containsStudentPrivateInfo: true },
      message: 'Dạ em chào mọi người, bé Na hnay điểm thi kém nhất lớp nhé ạ.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.issues.some(i => i.type === 'PRIVATE_STUDENT_INFO_IN_GROUP_CHAT')).toBe(true);
  });

  it('10. suggested rewrite is safer and does not contain raw phone/OTP/token/password', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ em chào chị, mật khẩu của bé là pwd123, sđt là 0987654321 nhé ạ.',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.suggestedRewrite).not.toContain('pwd123');
    expect(res.suggestedRewrite).not.toContain('0987654321');
  });

  it('11. deterministic output', () => {
    const res1 = checkMessageQuality({ ...baseOptions, message: 'Dạ chào bạn, bao đậu nhé ạ.' });
    const res2 = checkMessageQuality({ ...baseOptions, message: 'Dạ chào bạn, bao đậu nhé ạ.' });
    expect(res1).toEqual(res2);
  });

  it('12. existing Phase 33 redaction tests still pass (verifying the regex)', () => {
    const res = checkMessageQuality({
      ...baseOptions,
      message: 'Dạ api key là sk-12345, token=abc',
    });
    expect(res.status).toBe('BLOCKED');
    expect(res.suggestedRewrite).not.toContain('sk-12345');
    expect(res.suggestedRewrite).not.toContain('abc');
  });
});
