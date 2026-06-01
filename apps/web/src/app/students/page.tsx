import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';

export default async function StudentsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/students")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return (
    <PageShell 
      title="Học viên" 
      description="Hồ sơ học viên và lịch sử học tập"
      primaryAction="Thêm học viên"
    />
  );
}
