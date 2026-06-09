"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { LeadStage } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export async function getLeads(filters?: { stage?: string; branch?: string; level?: string }) {
  const tenantId = await getCurrentTenantOrThrow();

  const whereClause: Prisma.LeadWhereInput = { tenantId };
  if (filters?.stage && filters.stage !== 'ALL') {
    whereClause.stage = filters.stage as LeadStage;
  }
  if (filters?.branch && filters.branch !== 'ALL') {
    whereClause.branch = filters.branch;
  }
  if (filters?.level && filters.level !== 'ALL') {
    whereClause.level = filters.level;
  }

  return prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { activities: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });
}

export async function createLead(data: {
  name: string;
  phone: string;
  parentName?: string;
  sourceId?: string;
  branch?: string;
  school?: string;
  dob?: Date;
  level?: string;
  socialLink?: string;
}) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const newLead = await prisma.lead.create({
    data: {
      tenantId,
      name: data.name,
      phone: data.phone,
      parentName: data.parentName,
      sourceId: data.sourceId,
      branch: data.branch,
      school: data.school,
      dob: data.dob,
      level: data.level,
      socialLink: data.socialLink,
      stage: 'NEW'
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'LEAD_CREATED',
    entityType: 'Lead',
    entityId: newLead.id,
    afterJson: { name: newLead.name, phone: newLead.phone, sourceId: newLead.sourceId, stage: newLead.stage },
    metadataJson: { source: 'lead_action' },
  });

  revalidatePath('/leads');
  return newLead;
}

export async function addCareLog(leadId: string, data: { type: string; notes: string; nextFollowUpAt?: Date }) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId }, select: { id: true, nextFollowUpAt: true } });
  if (!lead) throw new Error('Lead not found');

  // Create LeadActivity
  const activity = await prisma.leadActivity.create({
    data: {
      tenantId,
      leadId,
      type: data.type,
      notes: data.notes
    }
  });

  // Update lead's next follow up date if provided
  if (data.nextFollowUpAt) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { nextFollowUpAt: data.nextFollowUpAt }
    });
  }

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'LEAD_CARE_LOG_ADDED',
    entityType: 'LeadActivity',
    entityId: activity.id,
    beforeJson: { nextFollowUpAt: lead.nextFollowUpAt },
    afterJson: { leadId, type: activity.type, nextFollowUpAt: data.nextFollowUpAt ?? null },
    metadataJson: { source: 'lead_action' },
  });

  revalidatePath('/leads');
  revalidatePath('/crm-command-center');
}

export async function createLeadFollowUpTask(leadId: string, data: { description: string; dueDate?: Date }) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;
  const description = data.description.trim();

  if (!description) throw new Error('Task description is required');

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
    select: { id: true, name: true, assignedToId: true }
  });
  if (!lead) throw new Error('Lead not found');

  const dueDate = data.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const task = await prisma.followUpTask.create({
    data: {
      tenantId,
      leadId,
      assignedTo: lead.assignedToId || session.userId,
      dueDate,
      description
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'LEAD_FOLLOW_UP_TASK_CREATED',
    entityType: 'FollowUpTask',
    entityId: task.id,
    afterJson: { leadId, leadName: lead.name, dueDate, description },
    metadataJson: { source: 'crm_command_center' },
  });

  revalidatePath('/leads');
  revalidatePath('/crm-command-center');
  revalidatePath('/workspaces/sales/calling');
  revalidatePath('/tasks');

  return task;
}

export async function convertLeadToStudent(leadId: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId }
  });

  if (!lead) throw new Error("Lead not found");

  if (lead.stage === 'REGISTERED') {
    const existingStudent = await prisma.student.findFirst({
      where: {
        tenantId,
        name: lead.name,
        phone: lead.phone
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingStudent) return existingStudent;

    throw new Error('Lead already converted');
  }

  // Create Student
  const student = await prisma.student.create({
    data: {
      tenantId,
      name: lead.name,
      phone: lead.phone,
      dob: lead.dob
    }
  });

  // Optionally create Guardian if parentName exists
  if (lead.parentName) {
    await prisma.guardian.create({
      data: {
        tenantId,
        name: lead.parentName,
        phone: lead.phone || '', // Assuming phone belongs to parent
        students: {
          connect: { id: student.id }
        }
      }
    });
  }

  // Mark lead as REGISTERED
  await prisma.lead.update({
    where: { id: lead.id },
    data: { stage: 'REGISTERED' }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'LEAD_CONVERTED_TO_STUDENT',
    entityType: 'Student',
    entityId: student.id,
    beforeJson: { leadId: lead.id, leadStage: lead.stage },
    afterJson: { studentId: student.id, leadStage: 'REGISTERED' },
    metadataJson: { source: 'lead_action' },
  });

  revalidatePath('/leads');
  revalidatePath('/crm-command-center');
  revalidatePath('/students');

  return student;
}
