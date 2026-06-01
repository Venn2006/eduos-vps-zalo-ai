import React from 'react';
import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';

export default async function ZaloInboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/zalo-inbox")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return <>{children}</>;
}
