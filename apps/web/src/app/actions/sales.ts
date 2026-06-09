"use server";

import { createAuditLog, prisma, CallOutcome, TrialBookingStatus } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const callOutcomeLabel = (outcome: CallOutcome) => {
  const labels: Record<CallOutcome, string> = {
    NO_ANSWER: 'khách chưa nghe máy',
    BUSY_CALLBACK: 'khách hẹn gọi lại',
    WRONG_NUMBER: 'sai số điện thoại',
    INTERESTED: 'khách quan tâm',
    ASKED_PRICE: 'khách hỏi học phí',
    NEEDS_PARENT_APPROVAL: 'cần phụ huynh xác nhận',
    NOT_INTERESTED: 'khách chưa quan tâm',
    BOOKED_TRIAL: 'đã đặt lịch học thử',
    ATTENDED_TRIAL: 'đã học thử',
    PAID: 'đã thanh toán',
    LOST: 'khách không còn nhu cầu',
  };

  return labels[outcome] || 'cần chăm sóc tiếp';
};

export async function logCallOutcome(leadId: string, saleId: string, outcome: CallOutcome, notes?: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const actorUserId = session.userId;
  const tenantId = session.activeTenantId;

  // Find lead and its tenant
  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
  if (!lead) throw new Error("Lead not found");

  // 1. Create Call Attempt
  await prisma.callAttempt.create({
    data: {
      tenantId,
      leadId,
      saleId: actorUserId,
      outcome,
      notes
    }
  });

  // 2. Determine new stage and actions based on outcome
  let newStage = lead.stage;
  let temperature = lead.temperature;
  let nextFollowUpAt: Date | undefined;
  
  if (outcome === "NO_ANSWER" || outcome === "BUSY_CALLBACK") {
    newStage = outcome === "NO_ANSWER" ? "NO_ANSWER" : "CALLBACK";
    // For NO_ANSWER, default follow up after 4 hours
    nextFollowUpAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    
    await prisma.followUpTask.create({
      data: {
        tenantId,
        leadId,
        assignedTo: actorUserId,
        dueDate: nextFollowUpAt,
        description: `Chăm sóc lại: ${callOutcomeLabel(outcome)}`
      }
    });
  } else if (outcome === "WRONG_NUMBER") {
    newStage = "NO_NEED";
    temperature = "COLD";
  } else if (outcome === "INTERESTED" || outcome === "ASKED_PRICE") {
    newStage = outcome === "INTERESTED" ? "INTERESTED" : "POTENTIAL";
    temperature = "HOT";
    // Draft AI response
    await prisma.zaloOutboxMessage.create({
      data: {
        tenantId,
        text: outcome === "ASKED_PRICE" ? "[AI Draft] Dạ học phí khoá học là..." : "[AI Draft] Dạ lộ trình học của khoá là...",
        status: "DRAFT"
      }
    });
  } else if (outcome === "NOT_INTERESTED") {
    newStage = "NOT_POTENTIAL";
    temperature = "COLD";
  } else if (outcome === "BOOKED_TRIAL") {
    newStage = "WAITING_TRIAL";
    temperature = "HOT";
  } else if (outcome === "ATTENDED_TRIAL") {
    newStage = "TRIALED";
    temperature = "HOT";
  } else if (outcome === "PAID") {
    newStage = "REGISTERED";
    temperature = "HOT";
  } else if (outcome === "LOST") {
    newStage = "NO_NEED";
    temperature = "COLD";
  }

  // 3. Update Lead
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: newStage,
      temperature,
      callCount: { increment: 1 },
      lastCallAt: new Date(),
      lastCallOutcome: outcome,
      nextFollowUpAt
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: actorUserId,
    action: 'SALES_CALL_OUTCOME_LOGGED',
    entityType: 'Lead',
    entityId: leadId,
    beforeJson: { stage: lead.stage, temperature: lead.temperature, clientSaleId: saleId },
    afterJson: { stage: newStage, temperature, outcome },
    metadataJson: { source: 'sales_action' },
  });

  revalidatePath('/workspaces/sales/calling');
  return { success: true };
}

export async function bookTrial(leadId: string, trialDate: Date, courseId: string, notes?: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;
  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
  if (!lead) throw new Error("Lead not found");

  const trialBooking = await prisma.trialBooking.create({
    data: {
      tenantId,
      leadId,
      courseId,
      trialDate,
      status: "BOOKED",
      studentNameSnapshot: lead.fullName || lead.name,
      parentNameSnapshot: lead.parentName,
      phoneSnapshot: lead.phone,
      interestedCourseSnapshot: courseId,
      assignedSaleId: lead.assignedToId || session.userId,
      noteSnapshot: notes
    }
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: "WAITING_TRIAL"
    }
  });

  // Create reminders
  const reminder24h = new Date(trialDate.getTime() - 24 * 60 * 60 * 1000);
  await prisma.followUpTask.create({
    data: {
      tenantId,
      leadId,
      assignedTo: lead.assignedToId || session.userId,
      dueDate: reminder24h,
      description: "Nhắc lịch học thử trước 24 giờ"
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'TRIAL_BOOKING_CREATED',
    entityType: 'TrialBooking',
    entityId: trialBooking.id,
    beforeJson: { leadId, leadStage: lead.stage },
    afterJson: { trialDate, courseId, leadStage: 'WAITING_TRIAL' },
    metadataJson: { source: 'sales_action' },
  });

  revalidatePath('/workspaces/sales/calling');
  revalidatePath('/trial-bookings');
  return { success: true };
}

export async function updateTrialStatus(trialId: string, newStatus: TrialBookingStatus, notes?: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;
  const trial = await prisma.trialBooking.findFirst({ where: { id: trialId, tenantId }, include: { lead: true } });
  if (!trial) throw new Error("Trial booking not found");

  if (trial.status === newStatus && (!notes || notes === trial.noteSnapshot)) {
    return { success: true, unchanged: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.trialBooking.update({
      where: { id: trialId },
      data: {
        status: newStatus,
        noteSnapshot: notes ? notes : trial.noteSnapshot
      }
    });

    if (newStatus === 'ATTENDED' && trial.status !== 'ATTENDED') {
      const postTrialDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await tx.followUpTask.create({
        data: {
          tenantId,
          leadId: trial.leadId,
          assignedTo: trial.assignedSaleId || trial.lead.assignedToId,
          dueDate: postTrialDate,
          description: "Chăm sóc sau học thử 24 giờ"
        }
      });

      await tx.lead.update({
        where: { id: trial.leadId },
        data: { stage: "TRIALED", temperature: "HOT" }
      });
    } else if (newStatus === 'CONVERTED') {
      await tx.lead.update({
        where: { id: trial.leadId },
        data: { stage: "REGISTERED", temperature: "HOT" }
      });
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'TRIAL_BOOKING_STATUS_UPDATED',
    entityType: 'TrialBooking',
    entityId: trialId,
    beforeJson: { status: trial.status, leadStage: trial.lead.stage },
    afterJson: { status: newStatus },
    metadataJson: { source: 'sales_action' },
  });

  revalidatePath('/trial-bookings');
  revalidatePath('/reports');
  return { success: true };
}
