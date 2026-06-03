import { AI_ADDON_CATALOG, getAIAddonsByCategory } from '../lib/aiAddonCatalog';

describe('AI Add-on Catalog', () => {
  it('all add-ons have a valid price or are marked as premium', () => {
    AI_ADDON_CATALOG.forEach((addon) => {
      const hasPrice = typeof addon.priceVndMonthly === 'number' && addon.priceVndMonthly > 0;
      const isPremium = addon.isPremium === true;
      expect(hasPrice || isPremium).toBe(true);
    });
  });

  it('no add-on claims real send is enabled by default', () => {
    AI_ADDON_CATALOG.forEach((addon) => {
      expect(addon.defaultMode).not.toBe('AUTO');
    });
  });

  it('risky add-ons require approval or handoff', () => {
    const admissionBot = AI_ADDON_CATALOG.find((a) => a.id === 'AI_ADMISSION_CONSULTANT');
    expect(admissionBot).toBeDefined();
    expect(admissionBot?.defaultMode).toBe('REVIEW_REQUIRED_FOR_HIGH_RISK');

    const reminderBot = AI_ADDON_CATALOG.find((a) => a.id === 'AI_CLASS_REMINDER');
    expect(reminderBot).toBeDefined();
    expect(reminderBot?.defaultMode).toBe('REVIEW_REQUIRED');
  });

  it('renewal care specifies max 3 follow-ups in description', () => {
    const renewalBot = AI_ADDON_CATALOG.find((a) => a.id === 'AI_RENEWAL_CARE');
    expect(renewalBot).toBeDefined();
    expect(renewalBot?.fullDescription).toContain('3 lần');
  });

  it('homework grading strictly requires teacher approval', () => {
    const hwBot = AI_ADDON_CATALOG.find((a) => a.id === 'AI_HOMEWORK_GRADING_REPORT');
    expect(hwBot).toBeDefined();
    expect(hwBot?.defaultMode).toBe('TEACHER_APPROVAL_REQUIRED');
  });

  it('content posting is draft/approval only', () => {
    const contentBot = AI_ADDON_CATALOG.find((a) => a.id === 'AI_CONTENT_POSTING');
    expect(contentBot).toBeDefined();
    expect(contentBot?.defaultMode).toBe('DRAFT_ONLY');
  });

  it('catalog output is deterministic and grouped correctly', () => {
    const grouped = getAIAddonsByCategory();
    expect(grouped['STUDENT_CARE']).toBeDefined();
    expect(grouped['ACADEMIC']).toBeDefined();
    expect(grouped['SALES']).toBeDefined();
    expect(grouped['MARKETING']).toBeDefined();
    expect(grouped['MANAGEMENT']).toBeDefined();

    expect(grouped['SALES'].length).toBeGreaterThanOrEqual(2);
  });
});
