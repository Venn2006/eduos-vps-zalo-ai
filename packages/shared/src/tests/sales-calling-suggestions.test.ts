import { getSuggestionForOutcome } from '../lib/salesCallingSuggestions';
import { CallOutcome } from '@prisma/client';

describe('Sales Calling Suggestions Helper', () => {
  it('should return null for null outcome', () => {
    expect(getSuggestionForOutcome(null)).toBeNull();
  });

  it('should return a deterministic suggestion for WRONG_NUMBER', () => {
    const result = getSuggestionForOutcome('WRONG_NUMBER');
    expect(result).not.toBeNull();
    expect(result?.label).toBe('Không cần nhắn');
    expect(result?.shouldSend).toBe(false);
    expect(result?.copy).toContain('Số điện thoại không đúng');
  });

  it('should return a valid suggestion for BOOKED_TRIAL', () => {
    const result = getSuggestionForOutcome('BOOKED_TRIAL');
    expect(result).not.toBeNull();
    expect(result?.shouldSend).toBe(true);
    expect(result?.label).toBe('Gợi ý xác nhận học thử');
    expect(result?.copy).toContain('đã ghi nhận lịch học thử');
  });

  it('should return a suggestion for all known outcomes', () => {
    const outcomes: CallOutcome[] = [
      'NO_ANSWER',
      'BUSY_CALLBACK',
      'INTERESTED',
      'ASKED_PRICE',
      'NEEDS_PARENT_APPROVAL',
      'BOOKED_TRIAL',
      'ATTENDED_TRIAL',
      'NOT_INTERESTED',
      'WRONG_NUMBER',
      'PAID',
      'LOST'
    ];

    for (const outcome of outcomes) {
      const result = getSuggestionForOutcome(outcome);
      expect(result).not.toBeNull();
      expect(result?.label).toBeDefined();
      expect(result?.copy).toBeDefined();
    }
  });

  it('should not contain any API or send logic in the copy text', () => {
    const result = getSuggestionForOutcome('NO_ANSWER');
    const text = result?.copy.toLowerCase() || '';
    expect(text).not.toContain('fetch');
    expect(text).not.toContain('send');
    expect(text).not.toContain('api');
  });
});
