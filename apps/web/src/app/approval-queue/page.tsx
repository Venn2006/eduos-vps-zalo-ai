import React from 'react';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ApprovalQueueClient } from './ApprovalQueueClient';

export default async function ApprovalQueuePage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/approval-queue')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const items = await prisma.sandboxOutboxItem.findMany({
    where: {
      tenantId,
      status: 'MOCK_READY',
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      channel: true,
      sourceType: true,
      status: true,
      readinessStatus: true,
      approvalStatus: true,
      recipientSafeLabel: true,
      messageSafeSummary: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 pb-10 h-full flex flex-col">
      <SectionHeader
        title="Việc cần kiểm tra"
        description="Kiểm duyệt các bản nháp trong hàng chờ trước khi nhân viên xử lý. Hệ thống không tự gửi tin ra Zalo/Facebook khi chưa được duyệt."
      />

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm">
        <ApprovalQueueClient
          items={items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
