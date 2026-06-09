"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth';

export type CreateManualFollowUpTaskInput = {
  leadId: string;
  assignedTo?: string;
  dueDate: string;
  description: string;
};

export async function createManualFollowUpTask(input: CreateManualFollowUpTaskInput) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const leadId = input.leadId?.trim();
  const description = input.description?.trim();
  const assignedTo = input.assignedTo?.trim() || session.userId;
  const dueDate = new Date(input.dueDate);

  if (!leadId) throw new Error('Vui lòng chọn khách liên quan');
  if (!description) throw new Error('Vui lòng nhập nội dung công việc');
  if (Number.isNaN(dueDate.getTime())) throw new Error('Deadline không hợp lệ');

  const [lead, assignee] = await Promise.all([
    prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null },
      select: {
        id: true,
        name: true,
        parentName: true,
        phone: true,
        stage: true,
        temperature: true
      }
    }),
    prisma.tenantMember.findFirst({
      where: { tenantId, userId: assignedTo, status: 'ACTIVE' },
      select: { userId: true }
    })
  ]);

  if (!lead) throw new Error('Không tìm thấy khách trong trung tâm này');
  if (!assignee) throw new Error('Người phụ trách không còn hoạt động');

  const task = await prisma.followUpTask.create({
    data: {
      tenantId,
      leadId: lead.id,
      assignedTo: assignee.userId,
      dueDate,
      description
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'FOLLOW_UP_TASK_CREATED',
    entityType: 'FollowUpTask',
    entityId: task.id,
    afterJson: { leadId: lead.id, leadName: lead.name, assignedTo: assignee.userId, dueDate, description },
    metadataJson: { source: 'tasks_page' },
  });

  revalidatePath('/tasks');
  revalidatePath('/crm-command-center');
  revalidatePath('/workspaces/sales/calling');

  return {
    id: task.id,
    leadId: lead.id,
    leadName: lead.name,
    parentName: lead.parentName,
    phone: lead.phone,
    leadStage: lead.stage,
    leadTemperature: lead.temperature,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate.toISOString(),
    description: task.description,
    isCompleted: task.isCompleted,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export async function setFollowUpTaskCompleted(taskId: string, isCompleted: boolean) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const task = await prisma.followUpTask.findFirst({
    where: { id: taskId, tenantId },
    select: { id: true, isCompleted: true, leadId: true, description: true }
  });

  if (!task) throw new Error('Không tìm thấy công việc');

  const updatedTask = await prisma.followUpTask.update({
    where: { id: task.id },
    data: { isCompleted }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: isCompleted ? 'FOLLOW_UP_TASK_COMPLETED' : 'FOLLOW_UP_TASK_REOPENED',
    entityType: 'FollowUpTask',
    entityId: task.id,
    beforeJson: { isCompleted: task.isCompleted },
    afterJson: { isCompleted, leadId: task.leadId, description: task.description },
    metadataJson: { source: 'tasks_page' },
  });

  revalidatePath('/tasks');
  revalidatePath('/crm-command-center');
  revalidatePath('/workspaces/sales/calling');

  return updatedTask;
}
