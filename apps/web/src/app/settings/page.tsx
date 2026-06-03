import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import Link from 'next/link';
import { Shield, CheckCircle, Database } from 'lucide-react';

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
        <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Kiểm soát truy cập (RBAC)</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 h-10">Quản lý phân quyền chi tiết cho nhân viên và lịch sử thao tác.</p>
          <div className="flex gap-4">
            <Link href="/settings/permissions" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              Quản lý phân quyền &rarr;
            </Link>
            <Link href="/settings/audit-log" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              Nhật ký hoạt động &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-slate-800">Sẵn sàng Go-Live</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 h-10">Kiểm tra các điều kiện an toàn trước khi vận hành thực tế.</p>
          <Link href="/settings/production-readiness" className="text-green-600 text-sm font-medium hover:text-green-700">
            Kiểm tra trạng thái &rarr;
          </Link>
        </div>
        
        <Link href="/settings/connectors" className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow block">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Trung tâm kết nối</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 h-10">Giám sát trạng thái Zalo VPS, Fanpage, và các kết nối khác.</p>
          <span className="text-amber-600 text-sm font-medium hover:text-amber-700">
            Quản lý kết nối &rarr;
          </span>
        </Link>
      </div>
    </PageShell>
  );
}
