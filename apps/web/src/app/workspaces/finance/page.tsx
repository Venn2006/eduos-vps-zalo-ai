import React from 'react';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { FinanceWorkspaceClient } from './FinanceWorkspaceClient';
import { getFinanceMetrics, getFinanceRecords, getExpenses } from '../../actions/finance';

export default async function FinanceWorkspacePage() {
  const authSession = await getSession();

  // strict RBAC check
  if (!canAccessRoute(authSession?.role, "/workspaces/finance")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const initialMetrics = await getFinanceMetrics();
  const initialRecords = await getFinanceRecords();
  const initialExpenses = await getExpenses();

  return <FinanceWorkspaceClient initialMetrics={initialMetrics} initialRecords={initialRecords} initialExpenses={initialExpenses} />;
}
