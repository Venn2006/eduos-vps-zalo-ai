import React from 'react';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageShell } from '@/components/layout/PageShell';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { PermissionsClient } from './PermissionsClient';

export default async function PermissionsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/settings')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  if (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN') {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return (
    <PageShell
      title="Phân quyền & kiểm soát (RBAC)"
      description="Ma trận quyền đang được enforce bởi route guard. Trang này chỉ đọc trạng thái, không lưu cấu hình giả."
    >
      <PermissionsClient />
    </PageShell>
  );
}
