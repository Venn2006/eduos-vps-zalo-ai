import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma, ZaloQueries } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import ZaloAccountsClient, { ZaloAccountWithSession, ZaloTenantStats } from './ZaloAccountsClient';

const colorClasses = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-orange-500 to-red-400',
  'from-emerald-500 to-teal-400',
];

const formatHeartbeat = (value: Date | null) => {
  if (!value) return 'Chưa có heartbeat';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(value);
};

export default async function ZaloAccountsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/zalo-accounts')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const zaloQueries = new ZaloQueries(prisma);
  const [data, connectedGroups, unprocessedMessages, messagesToday, latestSession] = await Promise.all([
    zaloQueries.getZaloAccountsForTenant(tenantId),
    prisma.zaloGroup.count({ where: { tenantId, isActive: true } }),
    prisma.zaloMessage.count({ where: { tenantId, isProcessed: false } }),
    prisma.zaloMessage.count({ where: { tenantId, createdAt: { gte: startOfToday } } }),
    prisma.zaloConnectorSession.findFirst({
      where: { tenantId, lastPing: { not: null } },
      orderBy: { lastPing: 'desc' },
      select: { lastPing: true },
    }),
  ]);

  const accounts: ZaloAccountWithSession[] = data.map((acc, index) => ({
    id: acc.id,
    name: acc.displayName,
    phone: acc.phoneNumber,
    avatar: acc.displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
    status: acc.status,
    lastHeartbeat: formatHeartbeat(acc.lastPing),
    connectorLabel: acc.lastPing ? 'VPS connector đã heartbeat' : 'Chưa có heartbeat từ VPS',
    sessionId: null,
    avatarColor: colorClasses[index % colorClasses.length],
  }));

  const onlineCount = accounts.filter((account) => account.status === 'ONLINE').length;
  const tenantStats: ZaloTenantStats = {
    connectedGroups,
    unprocessedMessages,
    messagesToday,
    onlineAccounts: onlineCount,
    totalAccounts: accounts.length,
    latestHeartbeat: formatHeartbeat(latestSession?.lastPing ?? null),
  };

  return <ZaloAccountsClient initialAccounts={accounts} tenantStats={tenantStats} />;
}
