import React from 'react';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageShell } from '@/components/layout/PageShell';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { getLeads } from '../actions/leads';
import { LeadsCrmClient } from './LeadsCrmClient';

export default async function LeadsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/leads')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const leads = await getLeads();

  return (
    <PageShell
      title="Khách tiềm năng"
      description="Theo dõi khách mới, chăm sóc tuyển sinh và chuyển khách đã đăng ký thành học viên."
    >
      <LeadsCrmClient initialLeads={leads} />
    </PageShell>
  );
}
