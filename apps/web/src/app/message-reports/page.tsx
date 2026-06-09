import React from 'react';
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AlertTriangle, BarChart3, Bot, Clock, MessageSquare, PieChart, ShieldCheck, Users } from 'lucide-react';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { prisma } from '@eduos/db';

type DayBucket = {
  date: Date;
  label: string;
  inbound: number;
  outbound: number;
};

const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;
const barHeight = (value: number, max: number) => max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;

export default async function MessageReportsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/message-reports')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const today = new Date();
  const weekStart = startOfDay(subDays(today, 6));
  const weekEnd = endOfDay(today);

  const [
    zaloInbound,
    zaloOutbound,
    facebookInbound,
    facebookOutbound,
    unprocessedZalo,
    activeZaloGroups,
    aiInteractions,
    pendingOutbox,
    sentOutbox,
    zaloMessages,
    facebookMessages,
    latestAiError,
  ] = await Promise.all([
    prisma.zaloMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.zaloMessage.count({ where: { tenantId, direction: 'OUTBOUND', createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.facebookMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.facebookMessage.count({ where: { tenantId, direction: 'OUTBOUND', createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.zaloMessage.count({ where: { tenantId, isProcessed: false } }),
    prisma.zaloGroup.count({ where: { tenantId, isActive: true } }),
    prisma.aiInteraction.count({ where: { tenantId, createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: { in: ['MOCK_READY', 'MOCK_QUEUED', 'MOCK_SENDING'] } } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: 'MOCK_SENT', createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.zaloMessage.findMany({
      where: { tenantId, createdAt: { gte: weekStart, lte: weekEnd } },
      select: { direction: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.facebookMessage.findMany({
      where: { tenantId, createdAt: { gte: weekStart, lte: weekEnd } },
      select: { direction: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.aiInteraction.findFirst({
      where: { tenantId, status: { not: 'COMPLETED' } },
      orderBy: { createdAt: 'desc' },
      select: { status: true, error: true, createdAt: true },
    }),
  ]);

  const buckets: DayBucket[] = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(addDays(weekStart, index));
    return {
      date,
      label: format(date, 'EEE', { locale: vi }),
      inbound: 0,
      outbound: 0,
    };
  });

  [...zaloMessages, ...facebookMessages].forEach((message) => {
    const bucket = buckets.find((item) => startOfDay(message.createdAt).getTime() === item.date.getTime());
    if (!bucket) return;
    if (message.direction === 'INBOUND') bucket.inbound += 1;
    if (message.direction === 'OUTBOUND') bucket.outbound += 1;
  });

  const totalMessages = zaloInbound + zaloOutbound + facebookInbound + facebookOutbound;
  const totalInbound = zaloInbound + facebookInbound;
  const totalOutbound = zaloOutbound + facebookOutbound;
  const maxDailyMessages = Math.max(1, ...buckets.map((bucket) => Math.max(bucket.inbound, bucket.outbound)));
  const channelRows = [
    { label: 'Zalo inbound', value: zaloInbound, color: 'bg-blue-500' },
    { label: 'Zalo outbound', value: zaloOutbound, color: 'bg-indigo-500' },
    { label: 'Fanpage inbound', value: facebookInbound, color: 'bg-emerald-500' },
    { label: 'Fanpage outbound', value: facebookOutbound, color: 'bg-amber-500' },
  ];
  const hasChartData = totalMessages > 0;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Message Analytics"
        description="Báo cáo tin nhắn từ dữ liệu Zalo/Fanpage, Hàng chờ duyệt và AI Interaction trong DB."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Tổng tin nhắn" value={totalMessages} trend="neutral" description="7 ngày gần nhất" icon={<MessageSquare className="h-5 w-5 text-blue-500" />} />
        <StatCard title="Inbound" value={totalInbound} trend="neutral" description="Zalo + Fanpage" icon={<Users className="h-5 w-5 text-indigo-500" />} />
        <StatCard title="Outbound" value={totalOutbound} trend="neutral" description="Tin gửi đã ghi DB" icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} />
        <StatCard title="Chưa xử lý" value={unprocessedZalo} trend={unprocessedZalo > 0 ? 'up' : 'neutral'} description="Zalo message pending" icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} />
        <StatCard title="AI interaction" value={aiInteractions} trend="neutral" description="7 ngày gần nhất" icon={<Bot className="h-5 w-5 text-fuchsia-500" />} />
        <StatCard title="Outbox chờ" value={pendingOutbox} trend={pendingOutbox > 0 ? 'up' : 'neutral'} description={`Đã xử lý: ${sentOutbox}`} icon={<Clock className="h-5 w-5 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border/50 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Lưu lượng tin nhắn theo ngày</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Inbound vs outbound trong 7 ngày qua</p>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="h-72 p-6">
            {hasChartData ? (
              <div className="flex h-full items-end justify-between gap-4">
                {buckets.map((bucket) => (
                  <div key={bucket.date.toISOString()} className="group relative flex h-full flex-1 flex-col justify-end gap-1">
                    <div className="flex h-full items-end justify-center gap-1 pb-7">
                      <div className="w-1/3 rounded-t-sm bg-blue-400" style={{ height: `${barHeight(bucket.inbound, maxDailyMessages)}%` }} />
                      <div className="w-1/3 rounded-t-sm bg-indigo-500" style={{ height: `${barHeight(bucket.outbound, maxDailyMessages)}%` }} />
                      <div className="pointer-events-none absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center rounded bg-slate-800 px-2 py-1.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        <span className="font-bold text-blue-300">In: {bucket.inbound}</span>
                        <span className="font-bold text-indigo-300">Out: {bucket.outbound}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-2 text-center text-xs font-medium text-slate-500">{bucket.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                Chưa có tin nhắn Zalo/Fanpage trong 7 ngày gần nhất.
              </div>
            )}
          </CardContent>
          <div className="flex justify-center gap-6 pb-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className="h-3 w-3 rounded-sm bg-blue-400" /> Inbound</div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className="h-3 w-3 rounded-sm bg-indigo-500" /> Outbound</div>
          </div>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border/50 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Phân bổ kênh</CardTitle>
                <p className="mt-1 text-xs text-slate-500">Tỷ lệ theo dữ liệu đã ghi nhận trong DB</p>
              </div>
              <PieChart className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="flex min-h-72 items-center justify-center gap-8 p-6">
            {hasChartData ? (
              <>
                <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-inner">
                  <div className="text-center">
                    <span className="block text-3xl font-black text-slate-800">{totalMessages}</span>
                    <span className="text-xs font-semibold text-slate-500">Tin nhắn</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {channelRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded shadow-sm ${row.color}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{row.label}</p>
                        <p className="text-xs text-slate-500">{percent(row.value, totalMessages)}% ({row.value} tin)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-slate-500">Chưa có dữ liệu phân bổ kênh.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Tình trạng xử lý</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 font-medium text-slate-500">
                <tr>
                  <th className="px-6 py-3">Hạng mục</th>
                  <th className="px-6 py-3">Số lượng</th>
                  <th className="px-6 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">Zalo group đang hoạt động</td>
                  <td className="px-6 py-4 text-slate-600">{activeZaloGroups}</td>
                  <td className="px-6 py-4 text-slate-600">Dùng để theo dõi group lớp đã liên kết.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">Hàng đang chờ duyệt</td>
                  <td className="px-6 py-4 text-slate-600">{pendingOutbox}</td>
                  <td className="px-6 py-4 text-slate-600">Tin nháp chưa gửi thật, cần review trước khi mở thật.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">AI interaction lỗi gần nhất</td>
                  <td className="px-6 py-4 text-slate-600">{latestAiError ? latestAiError.status : 'Không có'}</td>
                  <td className="px-6 py-4 text-slate-600">{latestAiError?.error || 'Chưa ghi nhận lỗi AI chưa hoàn tất.'}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
