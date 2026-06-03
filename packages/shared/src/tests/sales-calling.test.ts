import { validateAndLogCallOutcome } from '../lib/salesCallingHelper';
import { CallOutcome } from '@prisma/client';

describe('Manual Call Outcome Logging Helper', () => {
  const defaultTenantId = 'tenant_123';
  
  let fetchLeadMock: jest.Mock;
  let executeTransactionMock: jest.Mock;

  beforeEach(() => {
    fetchLeadMock = jest.fn();
    executeTransactionMock = jest.fn();
  });

  test('Rejects unknown/undefined role', async () => {
    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'TEACHER', // blocked
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      role: 'UNKNOWN' as any,
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Bạn không có quyền thực hiện thao tác này');

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: undefined as any,
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Bạn không có quyền thực hiện thao tác này');
  });

  test('SALE cannot log call if userId is missing', async () => {
    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: undefined,
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Bạn cần đăng nhập để thực hiện thao tác này');
  });

  test('Rejects invalid CallOutcome enum', async () => {
    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'INVALID_ENUM' as any,
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Kết quả cuộc gọi không hợp lệ');
  });

  test('Rejects missing lead / cross-tenant', async () => {
    fetchLeadMock.mockResolvedValue(null);

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_not_exist',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Không tìm thấy Lead hoặc Lead thuộc cơ sở khác');
  });

  test('SALE cannot log call for unassigned lead', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'other_user' });

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'INTERESTED',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Bạn chỉ có thể cập nhật trạng thái cho lead được giao cho bạn');
  });

  test('SALE successfully logs call for their assigned lead - INTERESTED creates follow-up', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });

    const result = await validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'INTERESTED',
      notes: 'Customer is very happy',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    });

    expect(result.success).toBe(true);
    
    expect(executeTransactionMock).toHaveBeenCalledTimes(1);
    const txData = executeTransactionMock.mock.calls[0][0];

    expect(txData.callAttemptData).toMatchObject({
      tenantId: defaultTenantId,
      leadId: 'lead_1',
      saleId: 'user_1',
      outcome: 'INTERESTED',
      notes: 'Customer is very happy',
    });
    expect(txData.callAttemptData.calledAt).toBeInstanceOf(Date);

    expect(txData.leadUpdateData).toMatchObject({
      callCount: { increment: 1 },
      lastCallOutcome: 'INTERESTED',
    });
    expect(txData.leadUpdateData.lastCallAt).toBeInstanceOf(Date);
    expect(txData.leadUpdateData.nextFollowUpAt).toBeInstanceOf(Date);

    expect(txData.followUpTaskData).toBeDefined();
    expect(txData.followUpTaskData).toMatchObject({
      tenantId: defaultTenantId,
      leadId: 'lead_1',
      assignedTo: 'user_1',
      isCompleted: false,
    });
    expect(txData.followUpTaskData.dueDate).toBeInstanceOf(Date);
    expect(txData.followUpTaskData.description).toContain('INTERESTED');
  });

  const createsFollowUpOutcomes = ['NO_ANSWER', 'BUSY_CALLBACK', 'INTERESTED', 'ASKED_PRICE', 'NEEDS_PARENT_APPROVAL'];
  test.each(createsFollowUpOutcomes)('Outcome %s creates a FollowUpTask', async (outcome) => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });
    executeTransactionMock.mockClear();

    const result = await validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: outcome as any,
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    });

    expect(result.success).toBe(true);
    const txData = executeTransactionMock.mock.calls[0][0];
    expect(txData.followUpTaskData).toBeDefined();
    expect(txData.followUpTaskData.assignedTo).toBe('user_1');
    expect(txData.followUpTaskData.dueDate).toBeInstanceOf(Date);
    expect(txData.leadUpdateData.nextFollowUpAt).toBeInstanceOf(Date);
    expect(txData.trialBookingData).toBeNull(); // explicitly confirm no booking created
  });

  const noFollowUpOutcomes = ['NOT_INTERESTED', 'WRONG_NUMBER', 'ATTENDED_TRIAL', 'PAID', 'LOST'];
  test.each(noFollowUpOutcomes)('Outcome %s does NOT create a FollowUpTask', async (outcome) => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });
    executeTransactionMock.mockClear();

    const result = await validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: outcome as any,
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    });

    expect(result.success).toBe(true);
    const txData = executeTransactionMock.mock.calls[0][0];
    expect(txData.followUpTaskData).toBeNull();
    expect(txData.leadUpdateData.nextFollowUpAt).toBeUndefined();
    expect(txData.trialBookingData).toBeNull(); // explicitly confirm no booking created
  });

  test('Throws if no assignee can be determined for a follow-up task', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: null });

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: undefined,
      role: 'ADMIN',
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Cannot create follow-up task: no assignee found');
  });

  test('BOOKED_TRIAL creates TrialBooking and NO FollowUpTask', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });
    executeTransactionMock.mockClear();

    const result = await validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'BOOKED_TRIAL',
      trialDate: '2026-10-10T10:00:00Z',
      studentName: 'Bé Na',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    });

    expect(result.success).toBe(true);
    const txData = executeTransactionMock.mock.calls[0][0];
    
    expect(txData.callAttemptData.outcome).toBe('BOOKED_TRIAL');
    expect(txData.followUpTaskData).toBeNull();
    
    expect(txData.trialBookingData).toBeDefined();
    expect(txData.trialBookingData).toMatchObject({
      tenantId: defaultTenantId,
      leadId: 'lead_1',
      assignedSaleId: 'user_1',
      studentNameSnapshot: 'Bé Na',
      status: 'BOOKED',
    });
    expect(txData.trialBookingData.trialDate).toBeInstanceOf(Date);
  });

  test('BOOKED_TRIAL throws if trialDate is missing', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'BOOKED_TRIAL',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Vui lòng nhập ngày giờ học thử');
  });

  test('BOOKED_TRIAL throws if trialDate is invalid date string', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'BOOKED_TRIAL',
      trialDate: 'not-a-real-date',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Ngày giờ học thử không hợp lệ');
  });

  test('ADMIN can log call for unassigned or other lead', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'user_1' });

    const result = await validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'admin_1',
      role: 'ADMIN',
      leadId: 'lead_1',
      outcome: 'PAID',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    });

    expect(result.success).toBe(true);
    
    const txData = executeTransactionMock.mock.calls[0][0];
    expect(txData.callAttemptData.saleId).toBe('admin_1');
    expect(txData.followUpTaskData).toBeNull();
    expect(txData.trialBookingData).toBeNull();
  });
});
