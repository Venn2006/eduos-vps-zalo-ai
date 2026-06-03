import { CallOutcome } from '@prisma/client';
import { addDays, startOfDay, setHours } from 'date-fns';

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

  // 5. Determine if a FollowUpTask is needed
  let followUpTaskData: any = null;
  const now = new Date();
  let nextFollowUpAt: Date | undefined = undefined;

  const saleIdToLog = isOwnerOrAdmin ? (userId || null) : userId;
  const assignedToFollowUp = lead.assignedToId || saleIdToLog; // default to existing assignee or current caller

  if (!assignedToFollowUp && (
    outcome === 'NO_ANSWER' ||
    outcome === 'BUSY_CALLBACK' ||
    outcome === 'INTERESTED' ||
    outcome === 'ASKED_PRICE' ||
    outcome === 'NEEDS_PARENT_APPROVAL'
  )) {
    throw new Error('Cannot create follow-up task: no assignee found');
  }

  if (
    outcome === 'NO_ANSWER' ||
    outcome === 'BUSY_CALLBACK' ||
    outcome === 'INTERESTED' ||
    outcome === 'ASKED_PRICE'
  ) {
    // Follow up tomorrow
    nextFollowUpAt = setHours(startOfDay(addDays(now, 1)), 9); // 9 AM tomorrow
    followUpTaskData = {
      tenantId,
      leadId,
      assignedTo: assignedToFollowUp,
      dueDate: nextFollowUpAt,
      description: `Follow up after call outcome: ${outcome}`,
      isCompleted: false,
    };
  } else if (outcome === 'NEEDS_PARENT_APPROVAL') {
    // Follow up in 2 days
    nextFollowUpAt = setHours(startOfDay(addDays(now, 2)), 9); // 9 AM in 2 days
    followUpTaskData = {
      tenantId,
      leadId,
      assignedTo: assignedToFollowUp,
      dueDate: nextFollowUpAt,
      description: `Follow up after call outcome: ${outcome}`,
      isCompleted: false,
    };
  }

  // 6. Build transaction payload and execute
  const leadUpdateData: any = {
    callCount: { increment: 1 },
    lastCallAt: now,
    lastCallOutcome: outcome,
  };

  if (nextFollowUpAt) {
    leadUpdateData.nextFollowUpAt = nextFollowUpAt;
  }

  await executeTransaction({
    callAttemptData: {
      tenantId,
      leadId,
      saleId: saleIdToLog,
      outcome,
      notes: notes || null,
      calledAt: now,
    },
    leadUpdateData,
    followUpTaskData,
  });

  return { success: true };
}
