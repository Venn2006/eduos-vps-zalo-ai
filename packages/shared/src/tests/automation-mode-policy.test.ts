import { determineAutomationMode, getAutomationModeLabel } from '../lib/automationModePolicy';

describe('Automation Mode Policy', () => {
  it('1. low-risk lead replies can be AUTO_LOW_RISK', () => {
    const mode = determineAutomationMode({
      intent: 'LEAD_FAQ',
      riskLevel: 'LOW',
      aiAddonEnabled: true
    });
    expect(mode).toBe('AUTO_LOW_RISK');
    expect(getAutomationModeLabel(mode)).toBe('Tự động (Rủi ro thấp)');
  });

  it('2. complaints require STAFF_HANDOFF', () => {
    const mode = determineAutomationMode({
      intent: 'COMPLAINT',
      riskLevel: 'HIGH',
      aiAddonEnabled: true
    });
    expect(mode).toBe('STAFF_HANDOFF');
    expect(getAutomationModeLabel(mode)).toBe('Chuyển người xử lý');
  });

  it('3. homework grading requires TEACHER_APPROVAL_REQUIRED', () => {
    const mode = determineAutomationMode({
      intent: 'HOMEWORK_GRADING',
      riskLevel: 'LOW',
      aiAddonEnabled: true
    });
    expect(mode).toBe('TEACHER_APPROVAL_REQUIRED');
  });

  it('4. renewal care max 3 follow-ups then STAFF_HANDOFF', () => {
    const mode1 = determineAutomationMode({
      intent: 'RENEWAL_CARE',
      riskLevel: 'LOW',
      followUpCount: 1,
      aiAddonEnabled: true
    });
    expect(mode1).toBe('AUTO_WITH_DASHBOARD_REPORT');

    const mode3 = determineAutomationMode({
      intent: 'RENEWAL_CARE',
      riskLevel: 'LOW',
      followUpCount: 3,
      aiAddonEnabled: true
    });
    expect(mode3).toBe('STAFF_HANDOFF');
  });

  it('5. returns OFF when aiAddonEnabled is false', () => {
    const mode = determineAutomationMode({
      intent: 'LEAD_FAQ',
      riskLevel: 'LOW',
      aiAddonEnabled: false
    });
    expect(mode).toBe('OFF');
  });

  it('6. outputs are deterministic and never emit MESSAGE_SENT', () => {
    const mode = determineAutomationMode({
      intent: 'OTHER',
      riskLevel: 'LOW',
      aiAddonEnabled: true
    });
    expect(mode).not.toBe('MESSAGE_SENT');
    expect(mode).toBe('DRAFT_ONLY');
  });
});
