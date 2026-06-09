import Link from 'next/link';
import React from 'react';
import { AlertTriangle, ExternalLink, Inbox, MessageSquare, ShieldCheck } from 'lucide-react';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageShell } from '@/components/layout/PageShell';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';

const formatTime = (value: Date) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(value);

const draftStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    MOCK_READY: 'Chờ duyệt',
    MOCK_QUEUED: 'Đã xếp hàng',
    MOCK_SENDING: 'Đang xử lý',
    MOCK_SENT: 'Đã hoàn tất',
    MOCK_FAILED: 'Có lỗi',
    MOCK_CANCELLED: 'Đã hủy',
    SANDBOX_READY: 'Sẵn sàng kiểm tra',
    SANDBOX_BLOCKED: 'Đang chặn',
    SANDBOX_REVIEW_REQUIRED: 'Cần kiểm tra',
  };

  return labels[status] || 'Cần kiểm tra';
};

export default async function ZaloInboxPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/zalo-inbox')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const zaloOutboxItems = await prisma.sandboxOutboxItem.findMany({
    where: { tenantId, channel: 'ZALO' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      status: true,
      readinessStatus: true,
      recipientSafeLabel: true,
      messageSafeSummary: true,
      createdAt: true,
    },
  });

  return (
    <PageShell
      title="Hộp thư Zalo"
      description="Trạng thái Zalo hiện tại của trung tâm. Kết nối thật đang ở chế độ khóa an toàn; chỉ hiển thị tin nháp chờ duyệt."
    >
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="mb-3 flex items-center gap-2 font-bold">
              <AlertTriangle className="h-5 w-5" /> Zalo thật chưa bật
            </div>
            <p className="text-sm kháching-6">
              Trang chat Zalo thử nghiệm đã được gỡ để tránh hiểu nhầm trong giai đoạn trải nghiệm trả phí. Hiện hệ thống chỉ cho phép tạo nháp vào Hàng chờ duyệt, không gửi tin thật ra Zalo.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Luồng nên dùng</h2>
            <div className="space-y-2">
              <Link href="/team-inbox" className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Team Inbox <ExternalLink className="h-4 w-4" />
              </Link>
              <Link href="/fanpage-inbox" className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Fanpage Inbox <ExternalLink className="h-4 w-4" />
              </Link>
              <Link href="/approval-queue" className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Hàng chờ duyệt <ExternalLink className="h-4 w-4" />
              </Link>
              <Link href="/zalo-accounts" className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Tài khoản Zalo <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Inbox className="h-5 w-5 text-primary" /> Tin Zalo chờ duyệt
                </h2>
                <p className="mt-1 text-sm text-slate-500">{zaloOutboxItems.length} nháp Zalo đang chờ duyệt.</p>
              </div>
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                <ShieldCheck className="mr-1 h-4 w-4" /> Không gửi thật
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {zaloOutboxItems.map((item) => (
              <div key={item.id} className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{item.recipientSafeLabel || 'Người nhận Zalo'}</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700">{item.messageSafeSummary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-700">{draftStatusLabel(item.status)}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">{draftStatusLabel(item.readinessStatus)}</span>
                </div>
              </div>
            ))}
            {zaloOutboxItems.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="mb-3 h-12 w-12 text-slate-200" />
                <p className="font-medium">Chưa có nháp Zalo cần duyệt.</p>
                <p className="mt-1 max-w-md text-sm">Các luồng tài chính và giáo viên có thể tạo nháp Zalo vào hàng chờ sau khi được duyệt.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
