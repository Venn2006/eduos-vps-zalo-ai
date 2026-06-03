import { CallOutcome } from '@prisma/client';
import { addDays, startOfDay, setHours } from 'date-fns';

export interface LogCallOutcomeParams {
  tenantId: string;
  userId: string | undefined;
  role: string | undefined;
  leadId: string;
  outcome: CallOutcome;
  notes?: string;
  trialDate?: string;
  studentName?: string;
  fetchLead: (params: { id: string; tenantId: string }) => Promise<{ id: string; assignedToId: string | null } | null>;
  executeTransaction: (data: any) => Promise<void>;
}

export async function validateAndLogCallOutcome(params: LogCallOutcomeParams) {
  const { tenantId, userId, role, leadId, outcome, notes, trialDate, studentName, fetchLead, executeTransaction } = params;

  // 1. RBAC Check
  if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'SALE') {
    throw new Error('Bạn không có quyền thực hiện thao tác này');
  }

  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';

  // 2. Basic validation
  if (!tenantId || (!isOwnerOrAdmin && !userId)) {
    throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
  }

  // 3. Validate outcome
  if (!Object.values(CallOutcome).includes(outcome)) {
    throw new Error('Kết quả cuộc gọi không hợp lệ');
  }

  // 4. Fetch lead
  const lead = await fetchLead({ id: leadId, tenantId });
  if (!lead) {
    throw new Error('Không tìm thấy Lead hoặc Lead thuộc cơ sở khác');
  }

  // 5. Role check for assigning
  if (!isOwnerOrAdmin && lead.assignedToId !== userId) {
    throw new Error('Bạn chỉ có thể cập nhật trạng thái cho lead được giao cho bạn');
  }

  // 5. Determine if a FollowUpTask or TrialBooking is needed
  let followUpTaskData: any = null;
  let trialBookingData: any = null;
  const now = new Date();
  let nextFollowUpAt: Date | undefined = undefined;

  const saleIdToLog = isOwnerOrAdmin ? (userId || null) : userId;
  const assignedToFollowUp = lead.assignedToId || saleIdToLog; // default to existing assignee or current caller

  if (outcome === 'BOOKED_TRIAL') {
    if (!trialDate) {
      throw new Error('Vui lòng nhập ngày giờ học thử');
    }
    const parsedDate = new Date(trialDate);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Ngày giờ học thử không hợp lệ');
    }
    
    trialBookingData = {
      tenantId,
      leadId,
      assignedSaleId: assignedToFollowUp,
      trialDate: parsedDate,
      studentNameSnapshot: studentName || null,
      noteSnapshot: notes || null,
      status: 'BOOKED',
    };
  } else {
    // Only create follow up if not booked trial
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
    trialBookingData,
  });

  return { success: true };
}
