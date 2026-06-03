import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default async function ProductionReadinessPage() {
  const authSession = await getSession();
  
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // Strictly OWNER/ADMIN
  if (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN') {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // MOCK DATA cho checklist
  const checklists = [
    {
      category: "Bảo mật & Phân quyền",
      items: [
        { name: "Phân lập dữ liệu theo Tenant", status: "ready", detail: "Đã bật trên toàn bộ truy vấn" },
        { name: "RBAC & Phân quyền", status: "ready", detail: "Đã bảo vệ mọi route nhạy cảm" },
        { name: "Thiết lập quyền quản trị viên", status: "ready", detail: "Chỉ OWNER/ADMIN có quyền cài đặt" },
      ]
    },
    {
      category: "Kết nối hệ thống",
      items: [
        { name: "Trạng thái webhook Fanpage", status: "warning", detail: "Cần cấu hình Verify Token" },
        { name: "Kết nối Zalo cá nhân (VPS)", status: "pending", detail: "Chưa quét mã QR" },
      ]
    },
    {
      category: "Dữ liệu trung tâm",
      items: [
        { name: "Cấu hình trung tâm (Tenant Info)", status: "ready", detail: "Đã thiết lập" },
        { name: "Nhập danh sách học viên mẫu", status: "pending", detail: "Chưa có dữ liệu" },
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="text-green-700 font-medium">Sẵn sàng</span>;
      case 'warning':
        return <span className="text-yellow-700 font-medium">Cần kiểm tra</span>;
      default:
        return <span className="text-slate-600 font-medium">Chưa cấu hình</span>;
    }
  };

  return (
    <PageShell 
      title="Kiểm tra Sẵn sàng Go-Live" 
      description="Đánh giá các điều kiện an toàn trước khi vận hành trung tâm thực tế."
    >
      <div className="max-w-4xl space-y-8">
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">Giao diện Báo cáo an toàn</p>
          <p>Trang này chỉ hiển thị trạng thái hiện tại. Không thực hiện thay đổi hệ thống trực tiếp từ đây.</p>
        </div>

        <div className="space-y-6">
          {checklists.map((group, idx) => (
            <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-5 py-3 border-b">
                <h3 className="font-bold text-slate-800">{group.category}</h3>
              </div>
              <div className="divide-y">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      {getStatusLabel(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
