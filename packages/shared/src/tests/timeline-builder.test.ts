import { buildTimelineEvent, filterTimelineForRole, redactSensitiveInfo, SafeTimelineEvent } from '../lib/timelineBuilder';

describe('timelineBuilder', () => {
  const baseEventParams = {
    id: 'e1',
    occurredAt: new Date('2026-06-03T10:00:00Z'),
    type: 'LEAD_CREATED' as const,
    title: 'New Lead',
    rawSummary: 'Hello',
    actorLabel: 'System',
    actorType: 'SYSTEM' as const,
    source: 'TEST'
  };

  it('1. timeline sorts newest or chronological consistently', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, id: '1', occurredAt: new Date('2026-06-01T10:00:00Z') }),
      buildTimelineEvent({ ...baseEventParams, id: '2', occurredAt: new Date('2026-06-03T10:00:00Z') }),
      buildTimelineEvent({ ...baseEventParams, id: '3', occurredAt: new Date('2026-06-02T10:00:00Z') })
    ];
    
    const sorted = filterTimelineForRole(events, 'OWNER');
    expect(sorted.length).toBe(3);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });

  it('2. safe summaries do not include phone numbers', () => {
    const raw = 'Liên hệ phụ huynh qua số 0912345678 nhé.';
    const safe = redactSensitiveInfo(raw);
    expect(safe).not.toContain('0912345678');
    expect(safe).toContain('[SĐT đã ẩn]');
  });

  it('3. safe summaries do not include OTP/token/password/api key', () => {
    const raw = 'Mật khẩu của hệ thống là: secret1234!';
    const event = buildTimelineEvent({ ...baseEventParams, rawSummary: raw });
    expect(event.safeSummary).not.toContain('secret1234!');
    expect(event.safeSummary).toContain('[BẢO MẬT]');
  });

  it('4. OWNER/ADMIN sees all safe event categories', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, type: 'PAYMENT_RECORDED' }),
      buildTimelineEvent({ ...baseEventParams, type: 'HOMEWORK_ASSIGNED' }),
      buildTimelineEvent({ ...baseEventParams, type: 'LEAD_CREATED' })
    ];
    
    const ownerEvents = filterTimelineForRole(events, 'OWNER');
    expect(ownerEvents.length).toBe(3);
    const adminEvents = filterTimelineForRole(events, 'ADMIN');
    expect(adminEvents.length).toBe(3);
  });

  it('5. SALE does not see finance-only or teacher-only details', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, type: 'PAYMENT_RECORDED' }), // FINANCE
      buildTimelineEvent({ ...baseEventParams, type: 'HOMEWORK_ASSIGNED' }), // TEACHER
      buildTimelineEvent({ ...baseEventParams, type: 'LEAD_CREATED' }), // SALES
      buildTimelineEvent({ ...baseEventParams, type: 'UNKNOWN' }) // LIMITED
    ];
    const saleEvents = filterTimelineForRole(events, 'SALE');
    expect(saleEvents.some(e => e.type === 'LEAD_CREATED')).toBe(true);
    expect(saleEvents.some(e => e.type === 'UNKNOWN')).toBe(true);
    expect(saleEvents.some(e => e.type === 'PAYMENT_RECORDED')).toBe(false);
    expect(saleEvents.some(e => e.type === 'HOMEWORK_ASSIGNED')).toBe(false);
  });

  it('6. TEACHER does not see sales-only or finance-only details', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, type: 'PAYMENT_RECORDED' }), // FINANCE
      buildTimelineEvent({ ...baseEventParams, type: 'HOMEWORK_ASSIGNED' }), // TEACHER
      buildTimelineEvent({ ...baseEventParams, type: 'LEAD_CREATED' }), // SALES
    ];
    const teacherEvents = filterTimelineForRole(events, 'TEACHER');
    expect(teacherEvents.some(e => e.type === 'HOMEWORK_ASSIGNED')).toBe(true);
    expect(teacherEvents.some(e => e.type === 'LEAD_CREATED')).toBe(false);
    expect(teacherEvents.some(e => e.type === 'PAYMENT_RECORDED')).toBe(false);
  });

  it('7. ACCOUNTANT does not see sales-only or teacher-only details', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, type: 'PAYMENT_RECORDED' }), // FINANCE
      buildTimelineEvent({ ...baseEventParams, type: 'HOMEWORK_ASSIGNED' }), // TEACHER
      buildTimelineEvent({ ...baseEventParams, type: 'LEAD_CREATED' }), // SALES
    ];
    const accountantEvents = filterTimelineForRole(events, 'ACCOUNTANT');
    expect(accountantEvents.some(e => e.type === 'PAYMENT_RECORDED')).toBe(true);
    expect(accountantEvents.some(e => e.type === 'HOMEWORK_ASSIGNED')).toBe(false);
    expect(accountantEvents.some(e => e.type === 'LEAD_CREATED')).toBe(false);
  });

  it('8. UNKNOWN sees no events', () => {
    const events: SafeTimelineEvent[] = [
      buildTimelineEvent({ ...baseEventParams, type: 'PAYMENT_RECORDED' }), 
      buildTimelineEvent({ ...baseEventParams, type: 'UNKNOWN' }), 
    ];
    const unknownEvents = filterTimelineForRole(events, 'UNKNOWN');
    expect(unknownEvents.length).toBe(0);
  });

  it('9. parent complaint becomes high/critical severity', () => {
    const event = buildTimelineEvent({ 
      ...baseEventParams, 
      type: 'PARENT_COMPLAINT_DETECTED', 
      rawSummary: 'Phụ huynh rất không hài lòng' 
    });
    expect(event.severity).toBe('HIGH');
  });

  it('10. deterministic output', () => {
    const event1 = buildTimelineEvent({ 
      ...baseEventParams, 
      rawSummary: '0987654321', 
      type: 'LEAD_CREATED' 
    });
    const event2 = buildTimelineEvent({ 
      ...baseEventParams, 
      rawSummary: '0987654321', 
      type: 'LEAD_CREATED' 
    });
    expect(event1).toEqual(event2);
  });
});
