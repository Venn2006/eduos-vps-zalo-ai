import { analyzeConversation, createSafeSummary } from '../lib/conversationIntelligence';

describe('conversationIntelligence', () => {
  describe('createSafeSummary (PII Redaction)', () => {
    it('redacts valid 10-digit phone numbers', () => {
      expect(createSafeSummary('My phone is 0981234567')).toBe('My phone is [PHONE_REDACTED]');
      expect(createSafeSummary('Call me at 090 123 4567')).toBe('Call me at [PHONE_REDACTED]');
      expect(createSafeSummary('Contact +84981234567')).toBe('Contact [PHONE_REDACTED]');
    });

    it('redacts secrets and passwords', () => {
      expect(createSafeSummary('Tài khoản của bạn có mật khẩu: 123456abc')).toBe('Tài khoản của bạn có mật khẩu [REDACTED]');
      expect(createSafeSummary('Đây là pass: secret123')).toBe('Đây là pass [REDACTED]');
      expect(createSafeSummary('Login with password mypass123')).toBe('Login with password [REDACTED]');
    });
  });

  describe('analyzeConversation', () => {
    it('classifies PARENT_COMPLAINT with CRITICAL severity', () => {
      const transcript = 'Trung tâm làm ăn quá tệ, cô giáo bạo lực với học sinh';
      const result = analyzeConversation(transcript, 'ZALO');

      expect(result.intent).toBe('PARENT_COMPLAINT');
      expect(result.severity).toBe('CRITICAL');
      expect(result.shouldCreateFollowUpTask).toBe(true);
      expect(result.suggestedTags).toContain('Rủi ro');
    });

    it('classifies TRIAL_BOOKING_REQUEST with HIGH severity', () => {
      const transcript = 'Mình muốn đăng ký cho bé học thử tuần sau';
      const result = analyzeConversation(transcript, 'FACEBOOK');

      expect(result.intent).toBe('TRIAL_BOOKING_REQUEST');
      expect(result.severity).toBe('HIGH');
      expect(result.suggestedTags).toContain('Muốn học thử');
    });

    it('classifies PRICE_QUESTION', () => {
      const transcript = 'Cho mình xin bảng giá học phí nhé';
      const result = analyzeConversation(transcript, 'FACEBOOK');

      expect(result.intent).toBe('PRICE_QUESTION');
      expect(result.severity).toBe('MEDIUM');
      expect(result.suggestedTags).toContain('Hỏi học phí');
    });

    it('redacts phones in the safeSummary of the analysis', () => {
      const transcript = 'Xin chào, số điện thoại của mình là 0912345678, mình muốn học thử';
      const result = analyzeConversation(transcript, 'ZALO');

      expect(result.intent).toBe('TRIAL_BOOKING_REQUEST');
      expect(result.safeSummary).not.toContain('0912345678');
      expect(result.safeSummary).toContain('[PHONE_REDACTED]');
    });
  });
});
