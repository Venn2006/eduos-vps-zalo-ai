"use server";

import { prisma, CallOutcome, LeadStage, TrialBookingStatus } from '@eduos/db';
import { revalidatePath } from 'next/cache';

export async function logCallOutcome(leadId: string, saleId: string, outcome: CallOutcome, notes?: string) {
  // Find lead and its tenant
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const tenantId = lead.tenantId;

  // 1. Create Call Attempt
  await prisma.callAttempt.create({
    data: {
      tenantId,
      leadId,
      saleId,
      outcome,
      notes
    }
  });

  // 2. Determine new stage and actions based on outcome
  let newStage = lead.stage;
  let temperature = lead.temperature;
  let nextFollowUpAt: Date | undefined;
  
  if (outcome === "NO_ANSWER" || outcome === "BUSY_CALLBACK") {
    newStage = "CONTACTED";
    // For NO_ANSWER, default follow up after 4 hours
    nextFollowUpAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    
    await prisma.followUpTask.create({
      data: {
        tenantId,
        leadId,
        assignedTo: saleId,
        dueDate: nextFollowUpAt,
        description: `Follow up after ${outcome}`
      }
    });
  } else if (outcome === "WRONG_NUMBER") {
    newStage = "LOST";
    temperature = "COLD";
  } else if (outcome === "INTERESTED" || outcome === "ASKED_PRICE") {
    newStage = "QUALIFIED";
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
    newStage = "LOST";
    temperature = "COLD";
  } else if (outcome === "BOOKED_TRIAL") {
    newStage = "BOOKED_TRIAL";
    temperature = "HOT";
  } else if (outcome === "ATTENDED_TRIAL") {
    newStage = "ATTENDED_TRIAL";
    temperature = "HOT";
  } else if (outcome === "PAID") {
    newStage = "WON";
    temperature = "HOT";
  } else if (outcome === "LOST") {
    newStage = "LOST";
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

  revalidatePath('/sales-calling');
  return { success: true };
}

export async function bookTrial(leadId: string, trialDate: Date, courseId: string, notes?: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const tenantId = lead.tenantId;

  await prisma.trialBooking.create({
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
      assignedSaleId: lead.assignedToId,
      noteSnapshot: notes
    }
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: "BOOKED_TRIAL"
    }
  });

  // Create reminders
  const reminder24h = new Date(trialDate.getTime() - 24 * 60 * 60 * 1000);
  await prisma.followUpTask.create({
    data: {
      tenantId,
      leadId,
      assignedTo: lead.assignedToId,
      dueDate: reminder24h,
      description: "24h Trial Reminder"
    }
  });

  revalidatePath('/sales-calling');
  revalidatePath('/trial-bookings');
  return { success: true };
}

export async function updateTrialStatus(trialId: string, newStatus: TrialBookingStatus, notes?: string) {
  const trial = await prisma.trialBooking.findUnique({ where: { id: trialId }, include: { lead: true } });
  if (!trial) throw new Error("Trial booking not found");

  const tenantId = trial.tenantId;

  await prisma.trialBooking.update({
    where: { id: trialId },
    data: {
      status: newStatus,
      noteSnapshot: notes ? notes : trial.noteSnapshot
    }
  });

  // If attended, we create a 24h follow up task
  if (newStatus === 'ATTENDED') {
    const postTrialDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await prisma.followUpTask.create({
      data: {
        tenantId,
        leadId: trial.leadId,
        assignedTo: trial.assignedSaleId || trial.lead.assignedToId,
        dueDate: postTrialDate,
        description: "24h Post-Trial Follow Up"
      }
    });

    // Update lead stage
    await prisma.lead.update({
      where: { id: trial.leadId },
      data: { stage: "ATTENDED_TRIAL", temperature: "HOT" }
    });
  } else if (newStatus === 'CONVERTED') {
    await prisma.lead.update({
      where: { id: trial.leadId },
      data: { stage: "WON", temperature: "HOT" }
    });
  }

  revalidatePath('/trial-bookings');
  revalidatePath('/reports');
  return { success: true };
}
