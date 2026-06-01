import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma, ZaloQueries } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import ZaloAccountsClient, { ZaloAccountWithSession } from './ZaloAccountsClient';

export default async function ZaloAccountsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/zalo-accounts")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const zaloQueries = new ZaloQueries(prisma);
  const data = await zaloQueries.getZaloAccountsForTenant(tenantId);

  const accounts: ZaloAccountWithSession[] = data.map((acc, index) => {
    const colors = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400',
      'from-orange-500 to-red-400',
      'from-emerald-500 to-teal-400'
    ];
    
    return {
      id: acc.id,
      name: acc.displayName,
      phone: acc.phoneNumber,
      avatar: acc.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      status: acc.status,
      connectedGroups: 0, // Placeholder
      unreadConversations: 0, // Placeholder
      messagesToday: 0, // Placeholder
      lastHeartbeat: acc.lastPing ? new Date(acc.lastPing).toLocaleTimeString() : 'N/A',
      device: 'VPS-01 (Hanoi)',
      sessionId: null, // Don't expose session token
      accountType: index === 0 ? 'Trợ lý chính' : 'Trợ lý phụ',
      avatarColor: colors[index % colors.length]
    };
  });

  return <ZaloAccountsClient initialAccounts={accounts} />;
}
