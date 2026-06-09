import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { prisma } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageShell } from '@/components/layout/PageShell';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';

type ReadinessStatus = 'ready' | 'warning' | 'blocked' | 'pending';

type ChecklistItem = {
  name: string;
  status: ReadinessStatus;
  detail: string;
};

const connectorStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ONLINE: 'Đang kết nối',
    OFFLINE: 'Đang tắt',
    ERROR: 'Có lỗi',
    EXPIRED: 'Hết hạn',
  };

  return labels[status] || 'Cần kiểm tra';
};

export default async function ProductionReadinessPage() {
  const authSession = await getSession();

  if (!canAccessRoute(authSession?.role, '/settings')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  if (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN') {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const [
    tenant,
    memberCount,
    activeAdminCount,
    leadCount,
    studentCount,
    classCount,
    invoiceCount,
    unpaidInvoiceCount,
    connectorSessions,
    facebookPageCount,
    sandboxReadyCount,
    sandboxSendingCount,
    billingAuditCount,
    latestWebhook,
    templateCount,
    automationSettingCount,
  ] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.tenantMember.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.tenantMember.count({ where: { tenantId, status: 'ACTIVE', role: { in: ['OWNER', 'ADMIN'] } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.student.count({ where: { tenantId, deletedAt: null } }),
    prisma.class.count({ where: { tenantId, deletedAt: null } }),
    prisma.invoice.count({ where: { tenantId, deletedAt: null } }),
    prisma.invoice.count({ where: { tenantId, deletedAt: null, status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } } }),
    prisma.zaloConnectorSession.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.facebookPage.count({ where: { tenantId, isActive: true } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: 'MOCK_READY' } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: { in: ['MOCK_QUEUED', 'MOCK_SENDING'] } } }),
    prisma.auditLog.count({ where: { tenantId, action: { contains: 'BILLING' } } }),
    prisma.webhookEvent.findFirst({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
    prisma.classAutomationTemplate.count({ where: { tenantId } }),
    prisma.classAutomationSetting.count({ where: { tenantId } }),
  ]);

  const hasTenantInfo = Boolean(tenant?.name && (tenant.hotline || tenant.email || tenant.address));
  const hasAnyConnectorOnline = connectorSessions.some((session) => session.status === 'ONLINE');
  const liveSendingBlocked = !hasAnyConnectorOnline && sandboxSendingCount === 0;

  const groups: Array<{ category: string; items: ChecklistItem[] }> = [
    {
      category: 'Bảo mật & phân quyền',
      items: [
        { name: 'Trung tâm hiện tại', status: tenant ? 'ready' : 'blocked', detail: tenant ? `${tenant.name} (${tenant.slug})` : 'Không tìm thấy trung tâm' },
        { name: 'Tài khoản đang hoạt động', status: memberCount > 0 ? 'ready' : 'blocked', detail: `${memberCount} tài khoản đang hoạt động` },
        { name: 'Tài khoản quản trị', status: activeAdminCount > 0 ? 'ready' : 'blocked', detail: `${activeAdminCount} tài khoản quản trị` },
        { name: 'Gửi tự động', status: liveSendingBlocked ? 'ready' : 'warning', detail: liveSendingBlocked ? 'Chưa có phiên gửi thật; đang an toàn cho giai đoạn trải nghiệm' : 'Có kết nối/hàng chờ cần kiểm tra kỹ trước khi mở cho khách' },
      ],
    },
    {
      category: 'Kết nối hệ thống',
      items: [
        { name: 'Phiên kết nối Zalo', status: connectorSessions.length === 0 ? 'pending' : hasAnyConnectorOnline ? 'warning' : 'ready', detail: connectorSessions.length === 0 ? 'Chưa có phiên kết nối' : connectorSessions.map((s) => `${connectorStatusLabel(s.status)} ${s.lastPing ? s.lastPing.toLocaleString('vi-VN') : ''}`).join(', ') },
        { name: 'Fanpage đang bật', status: facebookPageCount > 0 ? 'ready' : 'pending', detail: `${facebookPageCount} fanpage đang bật` },
        { name: 'Sự kiện kết nối gần nhất', status: latestWebhook ? 'ready' : 'pending', detail: latestWebhook ? `${latestWebhook.source} - ${latestWebhook.createdAt.toLocaleString('vi-VN')}` : 'Chưa có sự kiện kết nối' },
        { name: 'Hàng chờ duyệt', status: sandboxReadyCount > 0 ? 'warning' : 'ready', detail: `${sandboxReadyCount} nháp đang chờ duyệt` },
      ],
    },
    {
      category: 'Dữ liệu trung tâm',
      items: [
        { name: 'Thông tin trung tâm', status: hasTenantInfo ? 'ready' : 'warning', detail: hasTenantInfo ? 'Đã có tên và thông tin liên hệ/cơ sở' : 'Nên bổ sung hotline/email/địa chỉ trước khi khách trải nghiệm' },
        { name: 'Khách tiềm năng', status: leadCount > 0 ? 'ready' : 'pending', detail: `${leadCount} khách` },
        { name: 'Học viên thật', status: studentCount > 0 ? 'ready' : 'pending', detail: `${studentCount} học viên` },
        { name: 'Lớp học thật', status: classCount > 0 ? 'ready' : 'pending', detail: `${classCount} lớp` },
      ],
    },
    {
      category: 'Tài chính & giai đoạn trải nghiệm trả phí',
      items: [
        { name: 'Hóa đơn đã lưu', status: invoiceCount > 0 ? 'ready' : 'pending', detail: `${invoiceCount} hóa đơn` },
        { name: 'Công nợ mở', status: unpaidInvoiceCount > 0 ? 'warning' : 'ready', detail: `${unpaidInvoiceCount} hóa đơn chưa tất toán` },
        { name: 'Lịch sử thanh toán', status: billingAuditCount > 0 ? 'ready' : 'pending', detail: `${billingAuditCount} lịch sử thanh toán` },
      ],
    },
    {
      category: 'Tự động hóa giai đoạn trải nghiệm',
      items: [
        { name: 'Mẫu tự động hóa lớp học', status: templateCount > 0 ? 'ready' : 'pending', detail: `${templateCount} mẫu đã lưu` },
        { name: 'Cấu hình tự động hóa theo lớp', status: automationSettingCount > 0 ? 'ready' : 'pending', detail: `${automationSettingCount} lớp đã cấu hình` },
        { name: 'Tin đang chờ/đang xử lý', status: sandboxSendingCount > 0 ? 'warning' : 'ready', detail: `${sandboxSendingCount} tin đang chờ hoặc đang xử lý duyệt trước` },
      ],
    },
  ];

  const flatItems = groups.flatMap((group) => group.items);
  const blocked = flatItems.filter((item) => item.status === 'blocked').length;
  const warnings = flatItems.filter((item) => item.status === 'warning').length;
  const pending = flatItems.filter((item) => item.status === 'pending').length;

  return (
    <PageShell
      title="Kiểm tra sẵn sàng vận hành thật"
      description="Checklist tính từ dữ liệu và cấu hình thật. Trang này chỉ đọc trạng thái, không tự thay đổi hệ thống."
    >
      <div className="max-w-5xl space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard label="Đang chặn" value={blocked} tone={blocked > 0 ? 'blocked' : 'ready'} />
          <SummaryCard label="Cần kiểm tra" value={warnings} tone={warnings > 0 ? 'warning' : 'ready'} />
          <SummaryCard label="Chưa cấu hình" value={pending} tone={pending > 0 ? 'pending' : 'ready'} />
          <SummaryCard label="Sẵn sàng" value={flatItems.length - blocked - warnings - pending} tone="ready" />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="mb-1 font-semibold">Báo cáo an toàn cho giai đoạn trải nghiệm trả phí</p>
          <p>Gửi tự động vẫn được coi là chưa mở nếu không có kết nối đang bật và không có hàng chờ gửi. Các luồng nhắn tin nên đi qua Hàng chờ duyệt/nhân sự kiểm tra.</p>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-bold text-slate-800">{group.category}</h3>
              </div>
              <div className="divide-y">
                {group.items.map((item) => (
                  <div key={item.name} className="flex flex-col gap-3 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <div className="text-sm">{getStatusLabel(item.status)}</div>
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

function getStatusIcon(status: ReadinessStatus) {
  switch (status) {
    case 'ready': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'blocked': return <XCircle className="h-5 w-5 text-rose-500" />;
    default: return <HelpCircle className="h-5 w-5 text-slate-300" />;
  }
}

function getStatusLabel(status: ReadinessStatus) {
  switch (status) {
    case 'ready': return <span className="font-medium text-green-700">Sẵn sàng</span>;
    case 'warning': return <span className="font-medium text-yellow-700">Cần kiểm tra</span>;
    case 'blocked': return <span className="font-medium text-rose-700">Đang chặn</span>;
    default: return <span className="font-medium text-slate-600">Chưa cấu hình</span>;
  }
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: ReadinessStatus }) {
  const color = tone === 'blocked' ? 'text-rose-700' : tone === 'warning' ? 'text-yellow-700' : tone === 'pending' ? 'text-slate-700' : 'text-green-700';
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
