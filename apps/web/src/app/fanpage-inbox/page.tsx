import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { FanpageInboxClient } from './FanpageInboxClient';

export default async function FanpageInboxPage() {
  const tenantId = await getCurrentTenantOrThrow();

  const rawConversations = await prisma.facebookConversation.findMany({
    where: { tenantId },
    orderBy: { lastMessage: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      lead: true,
    }
  });

  // Fetch pending AI suggestions for these conversations
  const suggestions = await prisma.aiSuggestion.findMany({
    where: {
      tenantId,
      context: { startsWith: 'FACEBOOK_CONVERSATION:' },
      isUsed: false
    }
  });

  const convWithSuggestions = rawConversations.map(conv => {
    return {
      ...conv,
      suggestions: suggestions.filter(s => s.context === `FACEBOOK_CONVERSATION:${conv.id}`)
    }
  });

  return (
    <PageShell 
      title="Fanpage Inbox" 
      description="Quản lý tin nhắn từ Facebook Fanpage"
    >
      <div className="mt-6">
        <FanpageInboxClient initialConversations={convWithSuggestions} />
      </div>
    </PageShell>
  );
}
