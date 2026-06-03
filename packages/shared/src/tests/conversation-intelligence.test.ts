import { analyzeConversation, createSafeSummary } from '../lib/conversationIntelligence';

describe('conversationIntelligence', () => {
  describe('createSafeSummary (PII Redaction)', () => {
    it('redacts all phone number formats', () => {
      const formats = [
        '0912345678',
        '0912 345 678',
        '0912-345-678',
        '0912.345.678',
        '+84 912 345 678',
        '84912345678',
        '84 912 345 678'
      ];
      formats.forEach(phone => {
        expect(createSafeSummary(`My phone is ${phone}`)).toBe('My phone is [PHONE_REDACTED]');
      });
    });

    it('redacts secrets and passwords', () => {
      expect(createSafeSummary('Tài khoản của bạn có mật khẩu: 123456abc')).toBe('Tài khoản của bạn có mật khẩu [REDACTED]');
      expect(createSafeSummary('Đây là pass: secret123')).toBe('Đây là pass [REDACTED]');
      expect(createSafeSummary('Login with password mypass123')).toBe('Login with password [REDACTED]');
    });

    it('redacts tokens, api keys, and OTPs', () => {
      expect(createSafeSummary('Your token is abcdef12345')).toBe('Your token [REDACTED]');
      expect(createSafeSummary('Use API key: x-api-123')).toBe('Use api key [REDACTED]');
      expect(createSafeSummary('Mã OTP của bạn là 123456')).toBe('mã OTP [REDACTED]');
      expect(createSafeSummary('Đây là OTP: 987654')).toBe('Đây là OTP [REDACTED]');
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
