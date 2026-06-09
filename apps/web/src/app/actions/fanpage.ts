"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth';

export async function createLeadFromFanpageConversation(conversationId: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const conversation = await prisma.facebookConversation.findFirst({
    where: { id: conversationId, tenantId },
    include: { lead: true }
  });

  if (!conversation) throw new Error('Conversation not found');
  if (conversation.lead) return conversation.lead;

  const lead = await prisma.lead.create({
    data: {
      tenantId,
      name: `Khách FB ${conversation.psid.slice(0, 6)}`,
      socialLink: `facebook:${conversation.psid}`,
      notes: 'Lead được tạo từ Fanpage Inbox',
      stage: 'NEW',
      temperature: 'WARM',
      assignedToId: session.userId
    }
  });

  await prisma.facebookConversation.update({
    where: { id: conversation.id },
    data: { leadId: lead.id }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'FANPAGE_CONVERSATION_LEAD_CREATED',
    entityType: 'Lead',
    entityId: lead.id,
    afterJson: { conversationId, psid: conversation.psid, leadName: lead.name },
    metadataJson: { source: 'fanpage_inbox' },
  });

  revalidatePath('/fanpage-inbox');
  revalidatePath('/leads');
  revalidatePath('/crm-command-center');

  return lead;
}

export async function createFanpageFollowUpTask(conversationId: string, description?: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const conversation = await prisma.facebookConversation.findFirst({
    where: { id: conversationId, tenantId },
    include: { lead: true }
  });

  if (!conversation) throw new Error('Conversation not found');

  let createdLead: { id: string; name: string } | null = null;
  const task = await prisma.$transaction(async (tx) => {
    let lead = conversation.lead;

    if (!lead) {
      lead = await tx.lead.create({
        data: {
          tenantId,
          name: `Khách FB ${conversation.psid.slice(0, 6)}`,
          socialLink: `facebook:${conversation.psid}`,
          notes: 'Lead được tạo từ Fanpage Inbox',
          stage: 'NEW',
          temperature: 'WARM',
          assignedToId: session.userId
        }
      });

      await tx.facebookConversation.update({
        where: { id: conversation.id },
        data: { leadId: lead.id }
      });

      createdLead = { id: lead.id, name: lead.name };
    }

    return tx.followUpTask.create({
      data: {
        tenantId,
        leadId: lead.id,
        assignedTo: lead.assignedToId || session.userId,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        description: description?.trim() || `Chăm sóc tiếp hội thoại Fanpage ${lead.name}`
      }
    });
  });

  const createdLeadForAudit = createdLead as { id: string; name: string } | null;
  if (createdLeadForAudit) {
    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'FANPAGE_CONVERSATION_LEAD_CREATED',
      entityType: 'Lead',
      entityId: createdLeadForAudit.id,
      afterJson: { conversationId, psid: conversation.psid, leadName: createdLeadForAudit.name },
      metadataJson: { source: 'fanpage_inbox', createdBy: 'follow_up_task' },
    });
  }

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'FANPAGE_FOLLOW_UP_TASK_CREATED',
    entityType: 'FollowUpTask',
    entityId: task.id,
    afterJson: { conversationId, leadId: task.leadId, description: task.description, dueDate: task.dueDate },
    metadataJson: { source: 'fanpage_inbox' },
  });

  revalidatePath('/fanpage-inbox');
  revalidatePath('/tasks');
  revalidatePath('/crm-command-center');
  if (createdLeadForAudit) revalidatePath('/leads');

  return task;
}

export async function queueFanpageSandboxReply(conversationId: string, content: string, suggestionId?: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;
  const trimmedContent = content.trim();

  if (!trimmedContent) throw new Error('Message content is required');

  const conversation = await prisma.facebookConversation.findFirst({
    where: { id: conversationId, tenantId },
    include: { page: true, lead: true }
  });

  if (!conversation) throw new Error('Conversation not found');

  const idempotencyKey = `fanpage_reply_${conversation.id}_${Date.now()}`;
  const item = await prisma.sandboxOutboxItem.create({
    data: {
      tenantId,
      sourceType: 'FANPAGE_CONVERSATION',
      sourceId: conversation.id,
      channel: 'FACEBOOK',
      connectorAccountId: conversation.page.pageId,
      recipientType: 'FACEBOOK_PSID',
      recipientId: conversation.psid,
      recipientSafeLabel: conversation.lead?.name || `Khách FB ${conversation.psid.slice(0, 6)}`,
      messageSafeSummary: trimmedContent,
      idempotencyKey,
      status: 'MOCK_READY',
      readinessStatus: 'SANDBOX_READY',
      approvalStatus: 'APPROVED_FOR_MANUAL_USE',
      createdByUserId: session.userId,
      events: {
        create: {
          tenantId,
          eventType: 'FANPAGE_REPLY_SANDBOX_QUEUED',
          safeSummary: trimmedContent,
          actorUserId: session.userId,
          actorRole: session.role,
          metadataJson: { conversationId, pageId: conversation.page.pageId }
        }
      }
    }
  });

  if (suggestionId) {
    await prisma.aiSuggestion.updateMany({
      where: { id: suggestionId, tenantId },
      data: { isUsed: true }
    });
  }

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'FANPAGE_REPLY_SANDBOX_QUEUED',
    entityType: 'SandboxOutboxItem',
    entityId: item.id,
    afterJson: { conversationId, channel: item.channel, status: item.status, recipientSafeLabel: item.recipientSafeLabel },
    metadataJson: { source: 'fanpage_inbox', suggestionId: suggestionId || null },
  });

  revalidatePath('/fanpage-inbox');
  revalidatePath('/settings/mock-outbox');

  return item;
}
