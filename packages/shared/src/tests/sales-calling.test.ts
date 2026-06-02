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
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Forbidden');

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: undefined, // blocked
      leadId: 'lead_1',
      outcome: 'NO_ANSWER',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Forbidden');
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
    })).rejects.toThrow('User ID is required for sales staff');
  });

  test('Rejects invalid CallOutcome enum', async () => {
    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1',
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'INVALID_OUTCOME',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('Invalid call outcome');
  });

  test('SALE rejected if lead is not assigned to them', async () => {
    fetchLeadMock.mockResolvedValue({ id: 'lead_1', assignedToId: 'some_other_sale' });

    await expect(validateAndLogCallOutcome({
      tenantId: defaultTenantId,
      userId: 'user_1', // different
      role: 'SALE',
      leadId: 'lead_1',
      outcome: 'INTERESTED',
      fetchLead: fetchLeadMock,
      executeTransaction: executeTransactionMock
    })).rejects.toThrow('You can only log calls for leads assigned to you');
  });

  test('SALE successfully logs call for their assigned lead', async () => {
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

    // CallAttempt payload
    expect(txData.callAttemptData).toMatchObject({
      tenantId: defaultTenantId,
      leadId: 'lead_1',
      saleId: 'user_1',
      outcome: 'INTERESTED',
      notes: 'Customer is very happy',
    });
    expect(txData.callAttemptData.calledAt).toBeInstanceOf(Date);

    // Lead metrics payload
    expect(txData.leadUpdateData).toMatchObject({
      callCount: { increment: 1 },
      lastCallOutcome: 'INTERESTED',
    });
    expect(txData.leadUpdateData.lastCallAt).toBeInstanceOf(Date);
  });

  test('ADMIN can log call for unassigned or other lead', async () => {
    // Admin has userId 'admin_1', but lead is assigned to 'user_1'
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
    
    // CallAttempt payload records admin's ID
    const txData = executeTransactionMock.mock.calls[0][0];
    expect(txData.callAttemptData.saleId).toBe('admin_1');
  });
});
