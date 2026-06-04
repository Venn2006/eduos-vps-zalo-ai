import React from 'react';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { TeacherWorkspaceClient } from './TeacherWorkspaceClient';

export default async function TeacherWorkspacePage() {
  const authSession = await getSession();

  // strict RBAC check
  if (!canAccessRoute(authSession?.role, "/workspaces/teacher")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // Delegate all UI and deterministic mock data logic to the Client component
  // No live Prisma calls for Phase 56 Sandbox hardening
  return <TeacherWorkspaceClient />;
}
