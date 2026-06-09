import React from 'react';
import { Check, Info, Shield, X } from 'lucide-react';
import { ROLE_MATRIX, type Role } from '@/lib/rbac';

type PermissionRow = {
  id: string;
  name: string;
  category: string;
  route: string;
};

const ROLES: Role[] = ['OWNER', 'ADMIN', 'SALE', 'TEACHER', 'ACCOUNTANT'];

const PERMISSIONS: PermissionRow[] = [
  { id: 'dashboard', name: 'Xem tổng quan', category: 'Chung', route: '/dashboard' },
  { id: 'workspaces', name: 'Xem danh mục workspace', category: 'Chung', route: '/workspaces' },
  { id: 'leads', name: 'CRM tuyển sinh', category: 'CRM & tuyển sinh', route: '/leads' },
  { id: 'sales_calling', name: 'Sales calling', category: 'CRM & tuyển sinh', route: '/workspaces/sales/calling' },
  { id: 'fanpage', name: 'Fanpage inbox', category: 'CRM & tuyển sinh', route: '/fanpage-inbox' },
  { id: 'team_inbox', name: 'Team inbox', category: 'CRM & tuyển sinh', route: '/team-inbox' },
  { id: 'tasks', name: 'Task follow-up', category: 'CRM & tuyển sinh', route: '/tasks' },
  { id: 'classes', name: 'Lớp học', category: 'Đào tạo', route: '/classes' },
  { id: 'teacher_workspace', name: 'Workspace giáo viên', category: 'Đào tạo', route: '/workspaces/teacher' },
  { id: 'attendance', name: 'Điểm danh', category: 'Đào tạo', route: '/attendance' },
  { id: 'homework', name: 'Bài tập', category: 'Đào tạo', route: '/homework' },
  { id: 'students', name: 'Học viên', category: 'Đào tạo', route: '/students' },
  { id: 'finance', name: 'Workspace tài chính', category: 'Tài chính', route: '/workspaces/finance' },
  { id: 'payments', name: 'Thanh toán', category: 'Tài chính', route: '/payments' },
  { id: 'renewals', name: 'Tái phí', category: 'Tài chính', route: '/renewals' },
  { id: 'ai_center', name: 'Trung tâm AI', category: 'AI & tự động hóa', route: '/ai-center' },
  { id: 'settings', name: 'Cài đặt hệ thống', category: 'Hệ thống', route: '/settings' },
];

export function PermissionsClient() {
  const categories = Array.from(new Set(PERMISSIONS.map((permission) => permission.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Shield className="h-5 w-5 text-indigo-600" /> Ma trận phân quyền đang áp dụng
          </h2>
          <p className="mt-1 text-sm text-slate-500">Read-only theo `ROLE_MATRIX` trong code. Không còn lưu local giả trên giao diện.</p>
        </div>
        <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">Read-only</span>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-1/3 p-4 font-semibold text-slate-600">Tính năng / route</th>
              {ROLES.map((role) => (
                <th key={role} className="border-l border-slate-100 p-4 text-center font-semibold text-slate-600">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <React.Fragment key={category}>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td colSpan={ROLES.length + 1} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700">{category}</td>
                </tr>
                {PERMISSIONS.filter((permission) => permission.category === category).map((permission) => (
                  <tr key={permission.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-700">{permission.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{permission.route}</p>
                    </td>
                    {ROLES.map((role) => {
                      const allowed = isAllowed(role, permission.route);
                      return (
                        <td key={role} className="border-l border-slate-100 p-4 text-center">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${allowed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {allowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>Lưu ý:</strong> thay đổi phân quyền runtime cần backend lưu policy, audit log và kiểm thử route guard. Hiện trang này chỉ phản ánh quyền đang được enforce trong code để tránh khách tưởng đã lưu cấu hình mới.
        </p>
      </div>
    </div>
  );
}

function isAllowed(role: Role, route: string) {
  const allowedRoutes = ROLE_MATRIX[role] || [];
  if (allowedRoutes.includes('*')) return true;
  return allowedRoutes.some((allowedRoute) => route === allowedRoute || (route.startsWith(`${allowedRoute}/`) && allowedRoute !== '/workspaces'));
}
