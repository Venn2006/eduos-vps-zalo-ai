import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';

export default async function ZaloAccountsSettingsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/settings')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const sessions = await prisma.zaloConnectorSession.findMany({
    where: { tenantId },
    include: {
      account: true
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <PageShell 
      title="Cài đặt Zalo Accounts" 
      description="Quản lý tài khoản Zalo Assistant kết nối VPS theo tenant hiện tại."
    >
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách VPS Connector</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3">Tài khoản</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Trạng thái Connector</th>
                <th className="p-3">Lần cuối hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-b">
                  <td className="p-3 font-medium">{s.account.displayName}</td>
                  <td className="p-3">{s.account.phoneNumber}</td>
                  <td className="p-3">
                    {s.status === 'ONLINE' ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> ONLINE
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span> OFFLINE
                      </span>
                    )}
                  </td>
                  <td className="p-3">{s.lastPing ? s.lastPing.toLocaleString('vi-VN') : 'Chưa có'}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">Chưa có connector nào được thiết lập.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
