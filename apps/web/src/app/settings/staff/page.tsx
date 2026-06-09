import React from 'react';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getSession, getCurrentTenantOrThrow } from '@/lib/auth';
import { prisma } from '@eduos/db';
import { StaffClient } from './StaffClient';

export default async function StaffPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const members = await prisma.tenantMember.findMany({
    where: { tenantId },
    include: { user: { select: { id: true, email: true, name: true } } }
  });

  return (
    <StaffClient initialMembers={members} />
  );
}
