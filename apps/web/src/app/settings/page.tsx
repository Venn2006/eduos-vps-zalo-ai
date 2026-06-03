import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';


export default async function SettingsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return (
    <PageShell 
      title="Cài đặt" 
      description="Cấu hình hệ thống và trung tâm"
    >
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/settings/permissions" className="block p-5 border rounded-lg bg-white hover:border-indigo-300 hover:shadow-sm transition-all">
          <h3 className="font-bold text-slate-800 mb-1">Phân quyền hệ thống</h3>
          <p className="text-sm text-slate-500">Cấu hình quyền truy cập theo vai trò và nhân viên</p>
        </a>
        <a href="/settings/connectors" className="block p-5 border rounded-lg bg-white hover:border-indigo-300 hover:shadow-sm transition-all">
          <h3 className="font-bold text-slate-800 mb-1">Trung tâm kết nối</h3>
          <p className="text-sm text-slate-500">Giám sát trạng thái Zalo VPS, Fanpage, và các kết nối khác</p>
        </a>
      </div>
    </PageShell>
  );
}
