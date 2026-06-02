import { CallOutcome } from '@prisma/client';

export interface LogCallOutcomeParams {
  tenantId: string;
  userId: string | undefined;
  role: string | undefined;
  leadId: string;
  outcome: string;
  notes?: string;
  // Mock dependencies for easy unit testing
  fetchLead: (leadId: string, tenantId: string) => Promise<{ id: string; assignedToId: string | null } | null>;
  executeTransaction: (data: any) => Promise<void>;
}

export async function validateAndLogCallOutcome(params: LogCallOutcomeParams) {
  const { tenantId, userId, role, leadId, outcome: outcomeRaw, notes, fetchLead, executeTransaction } = params;

  // 1. RBAC Check (simulate canAccessRoute check for SALE/ADMIN/OWNER)
  if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'SALE') {
    throw new Error('Forbidden');
  }

  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';

  // 2. Missing user check for SALE
  if (!isOwnerOrAdmin && !userId) {
    throw new Error('User ID is required for sales staff');
  }

  if (!leadId || !outcomeRaw) {
    throw new Error('Missing required fields');
  }

  // 3. Validate outcome enum
  const validOutcomes = Object.values(CallOutcome);
  if (!validOutcomes.includes(outcomeRaw as CallOutcome)) {
    throw new Error('Invalid call outcome');
  }
  const outcome = outcomeRaw as CallOutcome;

  // 4. Fetch Lead and verify assignment
  const lead = await fetchLead(leadId, tenantId);
  if (!lead) {
    throw new Error('Lead not found or unauthorized');
  }

  if (!isOwnerOrAdmin && lead.assignedToId !== userId) {
    throw new Error('You can only log calls for leads assigned to you');
  }

  // 5. Build transaction payload and execute
  const saleIdToLog = isOwnerOrAdmin ? (userId || null) : userId;
  
  await executeTransaction({
    callAttemptData: {
      tenantId,
      leadId,
      saleId: saleIdToLog,
      outcome,
      notes: notes || null,
      calledAt: new Date(),
    },
    leadUpdateData: {
      callCount: { increment: 1 },
      lastCallAt: new Date(),
      lastCallOutcome: outcome,
    }
  });

  return { success: true };
}
