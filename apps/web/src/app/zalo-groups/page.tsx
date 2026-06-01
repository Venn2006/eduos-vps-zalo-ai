import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma, ZaloQueries } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';

export default async function ZaloGroupsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/zalo-groups")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const zaloQueries = new ZaloQueries(prisma);
  const groups = await zaloQueries.getZaloGroupsForTenant(tenantId);

  return (
    <PageShell 
      title="Zalo Groups" 
      description="Quản lý các nhóm Zalo lớp học, trạng thái liên kết và tự động hóa."
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách nhóm Zalo (Zalo VPS Connector)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="p-3">Tên nhóm</th>
                <th className="p-3">Trạng thái liên kết</th>
                <th className="p-3">Điểm danh Auto</th>
                <th className="p-3">Trạng thái Cài đặt</th>
                <th className="p-3">Lần cuối nhắc lịch</th>
                <th className="p-3">Lần cuối điểm danh</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g: any) => (
                <tr key={g.id} className="border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">{g.name}</td>
                  <td className="p-3">
                    {g.className ? (
                      <span className="text-emerald-600 font-semibold">{g.className}</span>
                    ) : (
                      <span className="text-orange-500 font-medium italic text-xs px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded">Cần Admin Review</span>
                    )}
                  </td>
                  <td className="p-3">
                    {g.automation?.attendance ? (
                      <span className="text-emerald-600 font-medium">Đang bật</span>
                    ) : (
                      <span className="text-zinc-400">Tắt</span>
                    )}
                  </td>
                  <td className="p-3">
                    {g.className ? (
                      <span className="text-emerald-600 text-xs flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Đã Setup</span>
                    ) : (
                      <span className="text-zinc-500 text-xs">Chờ lệnh /setup</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {g.lastReminder ? g.lastReminder.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {g.lastAttendance ? g.lastAttendance.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:underline text-sm font-medium">Cấu hình</button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">Chưa có nhóm nào. Vui lòng thêm Zalo Assistant vào nhóm.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

