import { getSession, getCurrentTenantOrThrow } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import { prisma } from '@eduos/db';
import { PageShell } from '@/components/layout/PageShell';
import { Activity, Clock, User, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function getActionLabel(action: string) {
  switch (action) {
    case 'SALES_CALL_OUTCOME_LOGGED': return 'Sale đã ghi nhận kết quả cuộc gọi';
    case 'FOLLOW_UP_TASK_CREATED': return 'Đã tạo việc cần theo dõi';
    case 'TRIAL_BOOKING_CREATED': return 'Đã tạo lịch học thử';
    case 'AI_PROMPT_SUBMITTED': return 'AI nhận câu hỏi';
    case 'AI_DRAFT_CREATED': return 'AI tạo nháp chờ duyệt';
    case 'AI_DRAFT_APPROVED': return 'Nháp AI được duyệt';
    case 'MESSAGE_SENT': return 'Tin nhắn đã được gửi';
    case 'PAYMENT_UPDATED': return 'Thanh toán được cập nhật';
    case 'PERMISSION_CHANGED': return 'Phân quyền được thay đổi';
    case 'CONNECTOR_RELOGIN': return 'Connector đăng nhập lại';
    default: return action;
  }
}

export default async function AuditLogPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings/audit-log")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const auditLogs = await prisma.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <PageShell 
      title="Nhật ký hoạt động" 
      description="Giám sát an toàn các thao tác quan trọng trên hệ thống. Dữ liệu chỉ hiển thị cho OWNER/ADMIN."
    >
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <span className="px-3 py-1 bg-slate-800 text-white text-sm font-medium rounded-full cursor-pointer whitespace-nowrap">Tất cả</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">Sales</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">AI</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">Finance</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">Phân quyền</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">Connector</span>
        <span className="px-3 py-1 bg-white text-slate-600 text-sm font-medium rounded-full border cursor-pointer hover:bg-slate-50 whitespace-nowrap">Tin nhắn</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Activity className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p>Chưa có nhật ký hoạt động.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => {
              // Parse metadata to extract safe summary
              let safeMeta = "";
              if (log.metadataJson) {
                try {
                  const meta = JSON.parse(log.metadataJson);
                  if (meta.outcome) {
                    safeMeta = `Kết quả: ${meta.outcome}`;
                  } else {
                    safeMeta = "Có thay đổi dữ liệu";
                  }
                } catch {
                  safeMeta = "Dữ liệu không định dạng";
                }
              }

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg shrink-0">
                    <Activity className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-slate-800 text-sm">
                        {getActionLabel(log.action)}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                        <User className="w-3 h-3" />
                        {log.actorId ? `User: ${log.actorId.slice(0, 8)}...` : "Hệ thống"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {log.entityType} {log.entityId ? `(#${log.entityId.slice(0, 6)}...)` : ''}
                      </span>
                      {safeMeta && (
                        <span className="text-slate-400 italic break-all">
                          - {safeMeta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
