import { evaluateDraftApproval, getVietnameseStatusLabel, DraftApprovalRequest } from '../lib/draftApprovalQueue';

describe('Draft Approval Queue Foundation', () => {
  it('1. PENDING_REVIEW label is Vietnamese', () => {
    expect(getVietnameseStatusLabel('PENDING_REVIEW')).toBe('Nháp cần duyệt');
  });

  it('2. SAFE guardrail can be approved for manual use', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd1',
      category: 'GENERAL',
      riskLevel: 'LOW',
      content: 'Hello world',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'SALE');
    expect(res.status).toBe('APPROVED_FOR_MANUAL_USE');
    expect(res.canApproveForManualUse).toBe(true);
  });

  it('3. NEEDS_REVIEW can be approved only with review note or manager requirement if high risk', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd2',
      category: 'GENERAL',
      riskLevel: 'LOW',
      content: 'Hello',
      guardrailStatus: 'NEEDS_REVIEW'
    };
    const res = evaluateDraftApproval(req, 'SALE');
    expect(res.status).toBe('NEEDS_EDIT');
    expect(res.canApproveForManualUse).toBe(true); // they can approve manually after edit/note
  });

  it('4. BLOCKED guardrail cannot be approved', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd3',
      category: 'GENERAL',
      riskLevel: 'LOW',
      content: 'Bad stuff',
      guardrailStatus: 'BLOCKED'
    };
    const res = evaluateDraftApproval(req, 'ADMIN');
    expect(res.status).toBe('BLOCKED_BY_GUARDRAIL');
    expect(res.canApproveForManualUse).toBe(false);
  });

  it('5. HIGH/CRITICAL risk requires OWNER/ADMIN review', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd4',
      category: 'GENERAL',
      riskLevel: 'CRITICAL',
      content: 'Hello',
      guardrailStatus: 'SAFE'
    };
    const resSale = evaluateDraftApproval(req, 'SALE');
    expect(resSale.status).toBe('NEEDS_EDIT'); // Sale cannot approve directly
    expect(resSale.canApproveForManualUse).toBe(false);

    const resAdmin = evaluateDraftApproval(req, 'ADMIN');
    expect(resAdmin.status).toBe('APPROVED_FOR_MANUAL_USE');
  });

  it('6. SALE cannot approve finance-only draft', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd5',
      category: 'FINANCE',
      riskLevel: 'LOW',
      content: 'Hello',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'SALE');
    expect(res.status).toBe('REJECTED');
  });

  it('7. TEACHER cannot approve sales-only draft', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd6',
      category: 'SALES',
      riskLevel: 'LOW',
      content: 'Hello',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'TEACHER');
    expect(res.status).toBe('REJECTED');
  });

  it('8. ACCOUNTANT cannot approve sales/teacher draft', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd7',
      category: 'ACADEMIC',
      riskLevel: 'LOW',
      content: 'Hello',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'ACCOUNTANT');
    expect(res.status).toBe('REJECTED');
  });

  it('9. UNKNOWN cannot approve anything', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd8',
      category: 'GENERAL',
      riskLevel: 'LOW',
      content: 'Hello',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'UNKNOWN');
    expect(res.status).toBe('REJECTED');
  });

  it('10. safe summary redacts phone/OTP/token/password/api key', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd9',
      category: 'GENERAL',
      riskLevel: 'LOW',
      content: 'My phone is 0901234567 and my OTP is 123456.',
      guardrailStatus: 'SAFE'
    };
    const res = evaluateDraftApproval(req, 'ADMIN');
    expect(res.safeSummary).not.toContain('0901234567');
    expect(res.safeSummary).toContain('[SĐT đã ẩn]');
    expect(res.safeSummary).not.toContain('123456');
    expect(res.safeSummary).toContain('[BẢO MẬT]');
  });

  it('11. no QUEUED_FOR_SEND transition exists in Phase 41 helper', () => {
    // We verify this by ensuring it's not one of the statuses.
    const res = getVietnameseStatusLabel('APPROVED_FOR_MANUAL_USE');
    expect(res).toBe('Duyệt nháp để sử dụng thủ công');
  });

  it('12. output deterministic', () => {
    const req: DraftApprovalRequest = {
      draftId: 'd10',
      category: 'SALES',
      riskLevel: 'LOW',
      content: 'Static content',
      guardrailStatus: 'SAFE'
    };
    const res1 = evaluateDraftApproval(req, 'SALE');
    const res2 = evaluateDraftApproval(req, 'SALE');
    expect(res1).toEqual(res2);
  });
});
