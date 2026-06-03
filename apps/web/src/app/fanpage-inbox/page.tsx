import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import { FanpageInboxClient } from './FanpageInboxClient';

export default async function FanpageInboxPage({ searchParams }: { searchParams: { filter?: string } }) {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/fanpage-inbox")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

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
        <FanpageInboxClient 
          initialConversations={convWithSuggestions} 
          initialFilter={searchParams.filter || 'ALL'}
        />
      </div>
    </PageShell>
  );
}
