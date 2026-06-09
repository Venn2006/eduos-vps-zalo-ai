import { TeamInboxClient } from './TeamInboxClient';
import { Metadata } from 'next';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Tin nhắn & Zalo | EduOS',
  description: 'Team Inbox and Zalo Hotline Governance',
};

export default async function TeamInboxPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/team-inbox')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [conversations, outboxItems, openTaskCount] = await Promise.all([
    prisma.facebookConversation.findMany({
      where: { tenantId },
      orderBy: { lastMessage: 'desc' },
      take: 50,
      include: {
        page: { select: { pageName: true } },
        lead: { select: { id: true, name: true, stage: true, temperature: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { text: true },
        },
        _count: { select: { messages: true } },
      },
    }),
    prisma.sandboxOutboxItem.findMany({
      where: { tenantId, channel: { in: ['FACEBOOK', 'ZALO'] } },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: {
        id: true,
        channel: true,
        status: true,
        readinessStatus: true,
        approvalStatus: true,
        recipientSafeLabel: true,
        messageSafeSummary: true,
        createdAt: true,
      },
    }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false } }),
  ]);

  return (
    <TeamInboxClient
      conversations={conversations.map((conversation) => ({
        id: conversation.id,
        psid: conversation.psid,
        pageName: conversation.page.pageName,
        lastMessageAt: conversation.lastMessage.toISOString(),
        lastText: conversation.messages[0]?.text || '',
        messageCount: conversation._count.messages,
        lead: conversation.lead ? {
          id: conversation.lead.id,
          name: conversation.lead.name,
          stage: conversation.lead.stage,
          temperature: conversation.lead.temperature,
        } : null,
      }))}
      outboxItems={outboxItems.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }))}
      openTaskCount={openTaskCount}
    />
  );
}
