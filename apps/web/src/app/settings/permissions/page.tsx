import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Shield, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

export default async function PermissionsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // Double check it's OWNER/ADMIN specifically just to be safe for this route.
  if (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN') {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return (
    <PageShell 
      title="Phân quyền hệ thống" 
      description="Quản lý quyền truy cập của các vai trò trong trung tâm"
    >
      <div className="max-w-4xl space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Hiện tại EduOS đang dùng quyền mặc định theo vai trò</h3>
            <p className="text-sm text-blue-800 mt-1">
              Sắp ra mắt: tuỳ chỉnh quyền theo nhân viên. Tùy chỉnh chi tiết sẽ được bật ở phase sau.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OWNER / ADMIN */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">OWNER / ADMIN</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Toàn quyền truy cập mọi tính năng</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Quản lý hệ thống và cài đặt</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Xem dữ liệu của toàn bộ chi nhánh</li>
            </ul>
          </div>

          {/* SALE */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800">SALE (Tư vấn viên)</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Không gian Sale & Leads</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Inbox Fanpage / Zalo</li>
              <li className="flex items-center gap-2 text-orange-600"><Lock className="w-3 h-3" /> Chỉ xem và thao tác trên Lead được phân công</li>
              <li className="flex items-center gap-2 text-orange-600"><Lock className="w-3 h-3" /> Không xem được dữ liệu tài chính/lớp học</li>
            </ul>
          </div>

          {/* TEACHER */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800">TEACHER (Giáo viên)</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Không gian Lớp học & Điểm danh</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Bài tập & Báo cáo phụ huynh</li>
              <li className="flex items-center gap-2 text-orange-600"><Lock className="w-3 h-3" /> Chỉ quản lý các lớp được phân công</li>
              <li className="flex items-center gap-2 text-orange-600"><Lock className="w-3 h-3" /> Không xem được dữ liệu doanh thu/tư vấn</li>
            </ul>
          </div>

          {/* ACCOUNTANT */}
          <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800">ACCOUNTANT (Kế toán)</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Không gian Tài chính & Thu chi</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Hoá đơn & Gia hạn</li>
              <li className="flex items-center gap-2 text-orange-600"><Lock className="w-3 h-3" /> Không xem được kịch bản chăm sóc Lead</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
