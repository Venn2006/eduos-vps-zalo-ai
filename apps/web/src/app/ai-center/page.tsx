import Link from 'next/link';
import React from 'react';
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { prisma } from '@eduos/db';
import { getFinanceSummaryForTenant } from '@eduos/api/src/services/finance.service';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { AiCommandBar } from '@/components/ui/AiCommandBar';
import { canAccessRoute } from '@/lib/rbac';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const formatMoney = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value);

const formatMoneyShort = (value: number) => {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)} triệu`;
  return formatMoney(value);
};

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const stageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    NEW: 'Mới',
    NO_ANSWER: 'Không nghe máy',
    CALLBACK: 'Hẹn gọi lại',
    INTERESTED: 'Quan tâm',
    POTENTIAL: 'Tiềm năng',
    WAITING_TRIAL: 'Chờ học thử',
    TRIALING: 'Đang học thử',
    TRIALED: 'Đã học thử',
    WAITING_TEST: 'Chờ kiểm tra',
    TESTED: 'Đã kiểm tra',
    REGISTERED: 'Đã đăng ký',
    NOT_POTENTIAL: 'Không tiềm năng',
    NO_NEED: 'Chưa có nhu cầu',
    BOOKED_TRIAL: 'Đã hẹn học thử',
    ATTENDED_TRIAL: 'Đã học thử',
    WON: 'Đã chốt',
    LOST: 'Mất cơ hội',
    CONTACTED: 'Đã liên hệ',
    QUALIFIED: 'Tiềm năng',
  };
  return labels[stage] || stage;
};

const temperatureLabel = (value: string) => {
  if (value === 'HOT') return 'Nóng';
  if (value === 'COLD') return 'Lạnh';
  return 'Ấm';
};

export default async function AiCenterPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const promptRaw = resolvedSearchParams.prompt;
  const prompt = typeof promptRaw === 'string' ? promptRaw.slice(0, 500) : '';

  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/ai-center')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = startOfDay(subDays(now, 6));

  const financeSummary = await getFinanceSummaryForTenant(tenantId);

  const [
    leadsToday,
    leadsThisMonth,
    hotLeads,
    trialToday,
    upcomingTrials,
    activeStudents,
    activeClasses,
    overdueTasks,
    unpaidInvoices,
    pendingOutbox,
    zaloInboundToday,
    facebookInboundToday,
    aiInteractionsToday,
    recentLeads,
    urgentTasks,
    leadStageCounts,
    weeklyLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, temperature: 'HOT' } }),
    prisma.trialBooking.count({ where: { tenantId, trialDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.trialBooking.count({ where: { tenantId, trialDate: { gte: now }, status: { in: ['BOOKED', 'REMINDED', 'RESCHEDULED'] } } }),
    prisma.student.count({ where: { tenantId, deletedAt: null } }),
    prisma.class.count({ where: { tenantId, deletedAt: null } }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false, dueDate: { lt: now } } }),
    prisma.invoice.aggregate({
      where: { tenantId, deletedAt: null, status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } },
      _count: { _all: true },
      _sum: { remainingAmount: true },
    }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: { in: ['MOCK_READY', 'MOCK_QUEUED', 'MOCK_SENDING'] } } }),
    prisma.zaloMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.facebookMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.aiInteraction.count({ where: { tenantId, createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, phone: true, stage: true, temperature: true, createdAt: true },
    }),
    prisma.followUpTask.findMany({
      where: { tenantId, isCompleted: false },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 5,
      include: { lead: { select: { name: true, phone: true } } },
    }),
    prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null, createdAt: { gte: weekStart } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const unreadMessages = zaloInboundToday + facebookInboundToday;
  const debtAmount = unpaidInvoices._sum.remainingAmount || 0;
  const totalAttention = overdueTasks + unpaidInvoices._count._all + pendingOutbox + hotLeads;
  const conversionBase = Math.max(1, leadsThisMonth);
  const conversionRate = Math.round((upcomingTrials / conversionBase) * 100);

  const leadBuckets = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(addDays(weekStart, index));
    const value = weeklyLeads.filter((lead) => startOfDay(lead.createdAt).getTime() === date.getTime()).length;
    return {
      label: format(date, 'EEE', { locale: vi }),
      value,
    };
  });
  const maxLeadBucket = Math.max(1, ...leadBuckets.map((bucket) => bucket.value));
  const pipelineTotal = Math.max(1, leadStageCounts.reduce((sum, item) => sum + item._count._all, 0));

  const attentionCards = [
    {
      title: 'Việc quá hạn',
      value: overdueTasks,
      detail: 'Cần xử lý trước',
      href: '/tasks?filter=overdue',
      color: 'bg-rose-500',
      text: 'text-rose-700',
    },
    {
      title: 'Công nợ mở',
      value: unpaidInvoices._count._all,
      detail: formatMoneyShort(debtAmount),
      href: '/workspaces/finance',
      color: 'bg-amber-500',
      text: 'text-amber-700',
    },
    {
      title: 'Khách nóng',
      value: hotLeads,
      detail: 'Ưu tiên gọi ngay',
      href: '/leads',
      color: 'bg-violet-500',
      text: 'text-violet-700',
    },
    {
      title: 'Tin chờ duyệt',
      value: pendingOutbox,
      detail: 'Xem trước khi gửi',
      href: '/approval-queue',
      color: 'bg-sky-500',
      text: 'text-sky-700',
    },
  ];

  const quickQuestions = [
    'Hôm nay cần xử lý gì trước?',
    'Tuyển sinh hôm nay ra sao?',
    'Công nợ cần chú ý bao nhiêu?',
    'Có tin nhắn phụ huynh nào cần xử lý không?',
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-lg bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
          <div className="space-y-6 bg-[#f7f3ff] p-5 sm:p-7 lg:p-8">
              <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold text-violet-700">Hôm nay, {format(now, 'dd/MM/yyyy')}</p>
                  <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Bảng điều hành trung tâm</h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">CEO chỉ cần nhìn nhanh doanh thu, tuyển sinh, công nợ và việc cần xử lý trong ngày.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/approval-queue" className="inline-flex h-10 items-center justify-center rounded-lg bg-violet-700 px-4 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-800">
                    Duyệt tin nháp
                  </Link>
                  <Link href="/settings/production-readiness" className="inline-flex h-10 items-center justify-center rounded-lg border border-violet-200 bg-white px-4 text-sm font-bold text-violet-700 hover:bg-violet-50">
                    Kiểm tra vận hành
                  </Link>
                </div>
              </header>

              <section className="rounded-lg bg-gradient-to-br from-violet-700 via-fuchsia-600 to-sky-500 p-5 text-white shadow-xl shadow-violet-300/40">
                <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                      <Sparkles className="h-4 w-4" /> Trợ lý điều hành
                    </div>
                    <h2 className="mb-4 text-2xl font-black">Hỏi nhanh tình hình trung tâm</h2>
                    <AiCommandBar initialPrompt={prompt} suggestions={quickQuestions} />
                  </div>
                  <div className="rounded-lg bg-white/15 p-4 ring-1 ring-white/20">
                    <p className="text-sm font-bold text-violet-100">Cần chú ý</p>
                    <p className="mt-2 text-5xl font-black">{formatNumber(totalAttention)}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/85">Tổng số việc quan trọng đang mở: khách nóng, công nợ, việc quá hạn và tin chờ duyệt.</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricTile title="Doanh thu tháng" value={formatMoneyShort(financeSummary.collectedThisMonth)} note="Đã thu" icon={<Wallet className="h-6 w-6" />} tone="violet" />
                <MetricTile title="Khách mới hôm nay" value={formatNumber(leadsToday)} note={`${formatNumber(hotLeads)} khách nóng`} icon={<PhoneCall className="h-6 w-6" />} tone="cyan" />
                <MetricTile title="Lịch học thử" value={formatNumber(trialToday)} note={`${formatNumber(upcomingTrials)} lịch sắp tới`} icon={<CalendarCheck className="h-6 w-6" />} tone="orange" />
                <MetricTile title="Học viên / Lớp" value={`${formatNumber(activeStudents)}/${formatNumber(activeClasses)}`} note="Đang hoạt động" icon={<Users className="h-6 w-6" />} tone="blue" />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Tuyển sinh 7 ngày</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Số khách mới theo ngày</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 px-3 py-2 text-right">
                      <p className="text-xs font-bold text-violet-500">Tháng này</p>
                      <p className="text-lg font-black text-violet-800">{formatNumber(leadsThisMonth)} khách</p>
                    </div>
                  </div>
                  <div className="flex h-64 items-end gap-3 rounded-lg bg-slate-50 p-4">
                    {leadBuckets.map((bucket) => (
                      <div key={bucket.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                        <div className="flex flex-1 items-end rounded-lg bg-white p-1 shadow-inner">
                          <div className="w-full rounded-lg bg-gradient-to-t from-violet-700 to-sky-400" style={{ height: `${Math.max(8, Math.round((bucket.value / maxLeadBucket) * 100))}%` }} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-slate-800">{bucket.value}</p>
                          <p className="text-xs font-semibold text-slate-400">{bucket.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Chuyển đổi</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Khách hẹn học thử</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-5 py-4">
                    <div className="grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#7c3aed_var(--p),#e9d5ff_0)] p-4" style={{ '--p': `${Math.min(100, conversionRate)}%` } as React.CSSProperties}>
                      <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner">
                        <div>
                          <p className="text-4xl font-black text-slate-950">{conversionRate}%</p>
                          <p className="text-xs font-bold text-slate-500">Tạm tính</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg bg-violet-50 p-3">
                        <p className="text-2xl font-black text-violet-800">{formatNumber(leadsThisMonth)}</p>
                        <p className="text-xs font-bold text-violet-500">Khách trong tháng</p>
                      </div>
                      <div className="rounded-lg bg-sky-50 p-3">
                        <p className="text-2xl font-black text-sky-800">{formatNumber(upcomingTrials)}</p>
                        <p className="text-xs font-bold text-sky-500">Lịch sắp tới</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-950">Cần xử lý ngay</h2>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-3">
                    {attentionCards.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-white">
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${item.color}`} />
                          <div>
                            <p className="font-black text-slate-900">{item.title}</p>
                            <p className="text-sm font-semibold text-slate-500">{item.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-black ${item.text}`}>{formatNumber(item.value)}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Tin mới & việc gần hạn</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Dễ hiểu, không hiển thị mã kỹ thuật</p>
                    </div>
                    <MessageSquare className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg bg-sky-50 p-4">
                      <p className="text-sm font-bold text-sky-700">Tin nhắn mới hôm nay</p>
                      <p className="mt-2 text-4xl font-black text-sky-900">{formatNumber(unreadMessages)}</p>
                      <Link href="/team-inbox" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900">
                        Mở hộp thư <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-4">
                      <p className="text-sm font-bold text-emerald-700">Trợ lý đã hỗ trợ hôm nay</p>
                      <p className="mt-2 text-4xl font-black text-emerald-900">{formatNumber(aiInteractionsToday)}</p>
                      <p className="mt-4 text-sm font-semibold text-emerald-700">Các lần hỏi được ghi lại để quản trị kiểm tra.</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {urgentTasks.map((task) => (
                      <Link key={task.id} href="/tasks" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-900">{task.description}</p>
                          <p className="text-sm font-semibold text-slate-500">{task.lead.name} · {task.lead.phone || 'chưa có số điện thoại'}</p>
                        </div>
                        <span className={task.dueDate < now ? 'rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700' : 'rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700'}>
                          {task.dueDate < now ? 'Quá hạn' : format(task.dueDate, 'dd/MM')}
                        </span>
                      </Link>
                    ))}
                    {urgentTasks.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">Không có việc chăm sóc đang mở.</p>}
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-950">Khách mới nhất</h2>
                    <Link href="/leads" className="text-sm font-bold text-violet-700 hover:text-violet-900">Xem tất cả</Link>
                  </div>
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <Link key={lead.id} href="/leads" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                        <div>
                          <p className="font-black text-slate-900">{lead.name}</p>
                          <p className="text-sm font-semibold text-slate-500">{lead.phone || 'Chưa có số điện thoại'} · {stageLabel(String(lead.stage))}</p>
                        </div>
                        <span className={lead.temperature === 'HOT' ? 'rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700' : 'rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600'}>
                          {temperatureLabel(String(lead.temperature))}
                        </span>
                      </Link>
                    ))}
                    {recentLeads.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có khách mới.</p>}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-950">Phễu tuyển sinh</h2>
                    <BadgeDollarSign className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="space-y-3">
                    {leadStageCounts.slice(0, 6).map((stage) => {
                      const width = Math.max(6, Math.round((stage._count._all / pipelineTotal) * 100));
                      return (
                        <div key={String(stage.stage)}>
                          <div className="mb-1 flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-700">{stageLabel(String(stage.stage))}</span>
                            <span className="text-slate-950">{formatNumber(stage._count._all)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-400" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {leadStageCounts.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có dữ liệu phễu tuyển sinh.</p>}
                  </div>
                </div>
              </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricTile({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  tone: 'violet' | 'cyan' | 'orange' | 'blue';
}) {
  const styles = {
    violet: 'from-violet-600 to-fuchsia-500 shadow-violet-200',
    cyan: 'from-cyan-500 to-sky-500 shadow-cyan-200',
    orange: 'from-orange-500 to-amber-400 shadow-orange-200',
    blue: 'from-blue-600 to-indigo-500 shadow-blue-200',
  };

  return (
    <div className={`rounded-lg bg-gradient-to-br p-5 text-white shadow-lg ${styles[tone]}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-white/85">{title}</p>
        <div className="rounded-lg bg-white/20 p-2 ring-1 ring-white/20">{icon}</div>
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-white/85">{note}</p>
    </div>
  );
}
