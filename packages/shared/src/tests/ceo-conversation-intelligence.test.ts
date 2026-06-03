import { generateCEOIntelligence } from '../lib/ceoConversationIntelligence';
import { SafeTimelineEvent } from '../lib/timelineBuilder';

describe('ceoConversationIntelligence', () => {
  const baseTimelineEvent: SafeTimelineEvent = {
    id: 'e1',
    occurredAt: new Date('2026-06-03T10:00:00Z'),
    type: 'UNKNOWN',
    title: 'Test',
    safeSummary: 'Safe summary',
    actorLabel: 'System',
    actorType: 'SYSTEM',
    source: 'TEST',
    severity: 'LOW',
    visibility: ['OWNER_ADMIN']
  };

  it('1. no risk returns OK', () => {
    const result = generateCEOIntelligence({});
    expect(result.overallStatus).toBe('OK');
    expect(result.urgentItems.length).toBe(0);
    expect(result.riskCards.length).toBe(0);
  });

  it('2. parent complaint returns NEEDS_ATTENTION or URGENT', () => {
    const result = generateCEOIntelligence({
      timelineEvents: [{
        ...baseTimelineEvent,
        type: 'PARENT_COMPLAINT_DETECTED',
        safeSummary: 'Phụ huynh than phiền'
      }]
    });
    // With 1 HIGH severity item and 1 parentComplaintCount, it can be NEEDS_ATTENTION or URGENT. 
    // Wait, the logic says:
    // if (metrics.highRiskCount > 1 || metrics.parentComplaintCount > 0) { URGENT }
    expect(result.overallStatus).toBe('URGENT');
    expect(result.urgentItems[0].category).toBe('PARENT_COMPLAINT');
  });

  it('3. multiple high severity items returns URGENT', () => {
    const result = generateCEOIntelligence({
      timelineEvents: [
        { ...baseTimelineEvent, type: 'RISK_DETECTED', severity: 'HIGH', id: '1' },
        { ...baseTimelineEvent, type: 'RISK_DETECTED', severity: 'HIGH', id: '2' }
      ]
    });
    expect(result.overallStatus).toBe('URGENT');
    expect(result.metrics.highRiskCount).toBe(2);
  });

  it('4. pending AI drafts increase attention', () => {
    const result = generateCEOIntelligence({ pendingDraftCount: 5 });
    expect(result.overallStatus).toBe('NEEDS_ATTENTION');
    expect(result.metrics.pendingDraftCount).toBe(5);
    expect(result.riskCards.some(r => r.category === 'AI_DRAFT_PENDING')).toBe(true);
  });

  it('5. follow-up due increases attention', () => {
    const currentDate = new Date('2026-06-03T10:00:00Z');
    const result = generateCEOIntelligence({
      currentDate,
      followUpTasks: [
        { id: 't1', dueDate: new Date('2026-06-01T10:00:00Z'), status: 'PENDING' } // Overdue
      ]
    });
    expect(result.overallStatus).toBe('NEEDS_ATTENTION');
    expect(result.metrics.followUpDueCount).toBe(1);
    expect(result.riskCards.some(r => r.category === 'UNANSWERED_LEAD')).toBe(true);
  });

  it('6. raw phones are redacted', () => {
    const result = generateCEOIntelligence({
      conversationAnalyses: [
        {
          intent: 'PARENT_COMPLAINT',
          severity: 'CRITICAL',
          suggestedNextAction: '',
          suggestedTags: [],
          shouldCreateFollowUpTask: false,
          shouldCreateAiDraft: false,
          safeSummary: 'Phụ huynh 0912345678 chửi thề.',
        } as any
      ]
    });
    // the riskCards go to urgentItems if severity is CRITICAL or intent is PARENT_COMPLAINT and category is MESSAGE_QUALITY_RISK.
    // wait, in my implementation it adds to `riskCards` first, and then it is moved to `urgentItems` if severity is CRITICAL or HIGH?
    // Let me check my implementation. It adds to `riskCards` with severity 'HIGH' but in my code it says `urgentItems` is filtered from `riskCards`.
    expect(result.urgentItems[0].safeSummary).not.toContain('0912345678');
    expect(result.urgentItems[0].safeSummary).toContain('[SĐT BẢO MẬT]');
  });

  it('7. raw OTP/token/password/api key are redacted', () => {
    const result = generateCEOIntelligence({
      conversationAnalyses: [
        {
          intent: 'PARENT_COMPLAINT',
          severity: 'CRITICAL',
          suggestedNextAction: '',
          suggestedTags: [],
          shouldCreateFollowUpTask: false,
          shouldCreateAiDraft: false,
          safeSummary: 'Pass là: secret1234',
        } as any
      ]
    });
    expect(result.urgentItems[0].safeSummary).not.toContain('secret1234');
    expect(result.urgentItems[0].safeSummary).toContain('[BẢO MẬT]');
  });

  it('8. risk is categorized correctly', () => {
    const result = generateCEOIntelligence({
      timelineEvents: [
        { ...baseTimelineEvent, type: 'TUITION_DUE' }
      ]
    });
    expect(result.riskCards.find(r => r.category === 'TUITION_RISK')).toBeDefined();
  });

  it('9. headline summarizes situation accurately', () => {
    const result1 = generateCEOIntelligence({});
    expect(result1.headline).toContain('Mọi thứ đang hoạt động ổn định.');

    const result2 = generateCEOIntelligence({ pendingDraftCount: 10 });
    expect(result2.headline).toContain('chú ý');
  });

  it('10. metrics count correctly', () => {
    const result = generateCEOIntelligence({
      timelineEvents: [
        { ...baseTimelineEvent, type: 'PARENT_COMPLAINT_DETECTED' },
        { ...baseTimelineEvent, type: 'TUITION_DUE' }
      ],
      conversationAnalyses: [
        { intent: 'UNKNOWN', severity: 'HIGH', suggestedNextAction: '', suggestedTags: ['Hỏi học phí', 'Xin học thử'], shouldCreateFollowUpTask: false, shouldCreateAiDraft: false, safeSummary: 'test' } as any,
        { intent: 'UNKNOWN', severity: 'LOW', suggestedNextAction: '', suggestedTags: ['Chưa phản hồi'], shouldCreateFollowUpTask: false, shouldCreateAiDraft: false, safeSummary: 'test' } as any
      ],
      pendingDraftCount: 3,
      currentDate: new Date('2026-06-03T10:00:00Z'),
      followUpTasks: [
        { id: '1', dueDate: new Date('2026-06-01T10:00:00Z'), status: 'PENDING' }
      ]
    });

    expect(result.metrics.parentComplaintCount).toBe(1);
    expect(result.metrics.tuitionQuestionCount).toBe(1); // From tags
    expect(result.metrics.trialBookingRequestCount).toBe(1); // From tags
    expect(result.metrics.unansweredLeadCount).toBe(1);
    expect(result.metrics.pendingDraftCount).toBe(3);
    expect(result.metrics.followUpDueCount).toBe(1);
    expect(result.metrics.urgentCount).toBe(1);
  });

  it('11. output is deterministic', () => {
    const result1 = generateCEOIntelligence({ pendingDraftCount: 2 });
    const result2 = generateCEOIntelligence({ pendingDraftCount: 2 });
    expect(result1.metrics).toEqual(result2.metrics);
    expect(result1.headline).toEqual(result2.headline);
  });

  it('12. recommended actions are Vietnamese and actionable', () => {
    const result = generateCEOIntelligence({ pendingDraftCount: 2 });
    expect(result.recommendedActions.length).toBeGreaterThan(0);
    expect(result.recommendedActions[0]).toMatch(/^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-ỹ]/); // Starts with uppercase Vietnamese letter
  });
});
