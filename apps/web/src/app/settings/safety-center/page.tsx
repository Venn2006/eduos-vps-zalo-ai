import React from 'react';
import { prisma } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { SafetyCenterClient, type SafetyMetric } from './SafetyCenterClient';

export const metadata = {
  title: 'Trung tâm an toàn | EduOS',
  description: 'Kiểm tra mức sẵn sàng và an toàn',
};

export default async function SafetyCenterPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/settings')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [connectorSessions, sandboxReady, sandboxSending, aiInteractions, openInvoices, automationSettings, auditLogs] = await Promise.all([
    prisma.zaloConnectorSession.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: 'MOCK_READY' } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: { in: ['MOCK_QUEUED', 'MOCK_SENDING'] } } }),
    prisma.aiInteraction.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId, deletedAt: null, status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } } }),
    prisma.classAutomationSetting.count({ where: { tenantId } }),
    prisma.auditLog.count({ where: { tenantId } }),
  ]);

  const hasLiveConnector = connectorSessions.some((session) => session.status === 'ONLINE');
  const metrics: SafetyMetric[] = [
    {
      id: 'messaging',
      title: 'Tự động gửi tin Zalo/Fanpage',
      description: hasLiveConnector
        ? 'Có kết nối đang bật. Cần kiểm tra quyền gửi, bộ lọc an toàn và hàng chờ duyệt trước khi mở cho khách.'
        : 'Không có kết nối online. Các tin phát sinh nên đi qua Hàng chờ duyệt/nhân sự kiểm tra.',
      statusLabel: hasLiveConnector ? 'Cần kiểm tra kết nối gửi thật' : 'Gửi tự động đang khóa',
      status: hasLiveConnector ? 'warning' : 'safe',
      icon: 'message',
    },
    {
      id: 'outbox',
      title: 'Hàng chờ duyệt',
      description: `${sandboxReady} item chờ duyệt, ${sandboxSending} item đang đang chờ/đang xử lý duyệt trước.`,
      statusLabel: sandboxSending > 0 ? 'Có item đang chạy duyệt trước' : 'Không có gửi live tự động',
      status: sandboxSending > 0 ? 'warning' : 'safe',
      icon: 'shield',
    },
    {
      id: 'finance',
      title: 'Nhắc phí và công nợ',
      description: `${openInvoices} hóa đơn chưa tất toán. Nhắc phí hiện tạo nháp duyệt trước, không tự gửi tiền/hóa đơn thật.`,
      statusLabel: openInvoices > 0 ? 'Có công nợ cần theo dõi' : 'Không có công nợ mở',
      status: openInvoices > 0 ? 'warning' : 'safe',
      icon: 'finance',
    },
    {
      id: 'ai',
      title: 'AI phân tích và bản nháp hành động',
      description: `${aiInteractions} lần AI hỗ trợ đã được ghi lại. Mọi hành động gửi ra ngoài vẫn cần duyệt trước.`,
      statusLabel: aiInteractions > 0 ? 'AI có lịch sử kiểm tra' : 'Chưa có lần AI hỗ trợ',
      status: aiInteractions > 0 ? 'safe' : 'warning',
      icon: 'ai',
    },
    {
      id: 'automation',
      title: 'Tự động hóa theo lớp',
      description: `${automationSettings} lớp đã có cấu hình tự động theo lớp. Mọi tự động hóa nhạy cảm cần nhân sự kiểm tra.`,
      statusLabel: automationSettings > 0 ? 'Đã cấu hình theo lớp' : 'Chưa cấu hình theo lớp',
      status: automationSettings > 0 ? 'safe' : 'warning',
      icon: 'shield',
    },
    {
      id: 'audit',
      title: 'Lịch sử kiểm tra',
      description: `${auditLogs} lịch sử đã ghi cho trung tâm. Các thao tác quan trọng cần tiếp tục ghi lịch sử trước khi mở rộng.`,
      statusLabel: auditLogs > 0 ? 'Lịch sử đang có dữ liệu' : 'Chưa có lịch sử kiểm tra',
      status: auditLogs > 0 ? 'safe' : 'blocked',
      icon: 'shield',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl py-6">
      <SafetyCenterClient metrics={metrics} />
    </div>
  );
}
