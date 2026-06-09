import React from 'react';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getSession, getCurrentTenantOrThrow } from '@/lib/auth';
import { prisma } from '@eduos/db';
import { ChannelsClient } from './ChannelsClient';

export default async function ChannelsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { zaloOaAppId: true, zaloOaToken: true }
  });

  return (
    <ChannelsClient initialConfig={{ zaloOaAppId: tenant?.zaloOaAppId || '', hasZaloOaToken: Boolean(tenant?.zaloOaToken) }} />
  );
}
