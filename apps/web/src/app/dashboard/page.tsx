import React from 'react';
import Link from 'next/link';
import { prisma } from '@eduos/db';
import { getFinanceSummaryForTenant } from '@eduos/api/src/services/finance.service';
import {
  AlertTriangle,
  BadgeDollarSign,
  Bot,
  ClipboardList,
  FileClock,
  History,
  Inbox,
  ListTodo,
  School,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageGuidanceBanner } from '@/components/ui/PageGuidanceBanner';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { canAccessRoute } from '@/lib/rbac';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';

const formatMoneyShort = (value: number) => {
  if (value === 0) return '0đ';
  return `${(value / 1000000).toFixed(1)}tr`;
};
const formatDateTime = (value: Date) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(value);

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
  };
  return labels[stage] || stage;
};

const auditActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    AI_KNOWLEDGE_BASE_CREATED: 'Đã thêm tài liệu AI',
    AI_KNOWLEDGE_BASE_DELETED: 'Đã xóa tài liệu AI',
    SANDBOX_OUTBOX_ITEM_CREATED: 'Đã tạo tin nháp chờ duyệt',
    SANDBOX_OUTBOX_ITEM_TRANSITIONED: 'Đã chuyển trạng thái tin nháp chờ duyệt',
    FANPAGE_REPLY_SANDBOX_QUEUED: 'Đã đưa phản hồi Fanpage vào hàng chờ duyệt',
    FANPAGE_CONVERSATION_LEAD_CREATED: 'Đã tạo khách từ Fanpage',
    FANPAGE_FOLLOW_UP_TASK_CREATED: 'Đã tạo việc chăm sóc Fanpage',
    LEAD_CREATED: 'Đã tạo khách',
    LEAD_CARE_LOG_CREATED: 'Đã thêm ghi chú chăm sóc khách',
    LEAD_FOLLOW_UP_TASK_CREATED: 'Đã tạo việc chăm sóc khách',
    LEAD_CONVERTED_TO_STUDENT: 'Đã chuyển khách thành học viên',
    TRIAL_BOOKED: 'Đã đặt lịch học thử',
    TRIAL_STATUS_UPDATED: 'Đã cập nhật lịch học thử',
    CALL_OUTCOME_LOGGED: 'Đã ghi nhận cuộc gọi',
    CLASS_CREATED: 'Đã tạo lớp học',
    BILLING_PAYMENT_CONFIRMATION_REQUESTED: 'Đã gửi yêu cầu xác nhận thanh toán',
    BILLING_UPGRADE_REQUESTED: 'Đã gửi yêu cầu nâng cấp gói',
    ATTENDANCE_UPDATED: 'Đã cập nhật điểm danh',
    BULK_ATTENDANCE_UPDATED: 'Đã cập nhật điểm danh hàng loạt',
    HOMEWORK_AI_GRADE_APPROVED: 'Đã duyệt điểm bài tập AI',
    PARENT_REPORT_APPROVED: 'Đã duyệt báo cáo phụ huynh',
    STUDENT_PROGRESS_NOTE_ADDED: 'Đã thêm ghi chú học viên',
    STUDENT_CLASS_ASSIGNED: 'Đã gắn học viên vào lớp',
    FOLLOW_UP_TASK_UPDATED: 'Đã cập nhật việc chăm sóc',
    STAFF_MEMBER_CREATED: 'Đã thêm nhân sự',
    CHANNEL_SETTINGS_UPDATED: 'Đã cập nhật cấu hình kênh',
  };

  return labels[action] || action
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
};

const auditEntityLabel = (entityType: string) => {
  const labels: Record<string, string> = {
    AiKnowledgeBase: 'Kho tri thức AI',
    SandboxOutboxItem: 'Hàng chờ duyệt',
    Lead: 'Khách',
    FollowUpViệc: 'Việc chăm sóc',
    TrialBooking: 'Lịch học thử',
    Class: 'Lớp học',
    Attendance: 'Điểm danh',
    Student: 'Học viên',
    TenantMember: 'Nhân sự',
    ChannelConfig: 'Cấu hình kênh',
    Billing: 'Thanh toán',
  };

  return labels[entityType] || 'Hoạt động hệ thống';
};

const memberStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'Đang hoạt động',
    INVITED: 'Đã mời',
    SUSPENDED: 'Tạm khóa',
  };

  return labels[status] || 'Chưa xác định';
};

const memberRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    OWNER: 'Chủ trung tâm',
    ADMIN: 'Quản trị',
    SALE: 'Tư vấn tuyển sinh',
    TEACHER: 'Giáo viên',
    ACCOUNTANT: 'Kế toán',
  };

  return labels[role] || 'Nhân sự';
};

const memberDisplayName = (role: string, index: number) => {
  if (role === 'OWNER') return 'Tài khoản chủ trung tâm';
  return `${memberRoleLabel(role)} ${index + 1}`;
};

export default async function DashboardPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/dashboard')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const now = new Date();

  const financeSummary = await getFinanceSummaryForTenant(tenantId);

  const [
    newKháchsToday,
    activeStudents,
    activeClasses,
    pendingAiDrafts,
    overdueInvoicesCount,
    openViệcsCount,
    overdueViệcsCount,
    sandboxReadyCount,
    pendingBillingRequests,
    recentKháchs,
    recentTaskss,
    recentAudits,
    tenantMembers,
    leadStageCounts,
  ] = await Promise.all([
    prisma.lead.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.student.count({ where: { tenantId, deletedAt: null } }),
    prisma.class.count({ where: { tenantId } }),
    prisma.aiGradeDraft.count({ where: { tenantId, isApproved: false } }),
    prisma.invoice.count({ where: { tenantId, status: 'OVERDUE' } }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false } }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false, dueDate: { lt: now } } }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: 'MOCK_READY' } }),
    prisma.auditLog.count({ where: { tenantId, action: 'BILLING_PAYMENT_CONFIRMATION_REQUESTED' } }),
    prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, phone: true, stage: true, temperature: true, createdAt: true },
    }),
    prisma.followUpTask.findMany({
      where: { tenantId, isCompleted: false },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { lead: { select: { name: true, phone: true } } },
    }),
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, action: true, entityType: true, createdAt: true },
    }),
    prisma.tenantMember.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    }),
  ]);

  const attentionItems = [
    overdueInvoicesCount > 0 ? {
      id: 'overdue-invoices',
      label: `${overdueInvoicesCount} hóa đơn quá hạn cần xử lý`,
      href: '/workspaces/finance',
      tone: 'danger' as const,
    } : null,
    overdueViệcsCount > 0 ? {
      id: 'overdue-việcs',
      label: `${overdueViệcsCount} việc chăm sóc quá hạn`,
      href: '/tasks?filter=overdue',
      tone: 'warning' as const,
    } : null,
    sandboxReadyCount > 0 ? {
      id: 'chờ duyệt-ready',
      label: `${sandboxReadyCount} tin nháp đang chờ duyệt`,
      href: '/approval-queue',
      tone: 'info' as const,
    } : null,
    pendingBillingRequests > 0 ? {
      id: 'billing-review',
      label: `${pendingBillingRequests} yêu cầu thanh toán cần kiểm tra`,
      href: '/billing',
      tone: 'info' as const,
    } : null,
    pendingAiDrafts > 0 ? {
      id: 'ai-drafts',
      label: `${pendingAiDrafts} bản nháp AI học thuật chờ duyệt`,
      href: '/homework',
      tone: 'warning' as const,
    } : null,
  ].filter(Boolean) as Array<{ id: string; label: string; href: string; tone: 'danger' | 'warning' | 'info' }>;

  return (
    <div className="w-full min-w-0 space-y-6 pb-10 lg:space-y-7">
      <PageGuidanceBanner
        title="Bảng điều hành CEO"
        description="Theo dõi số liệu thật từ hệ thống: doanh thu, khách, công nợ, việc cần xử lý và hàng chờ duyệt gần đây. Các kết nối thật vẫn ở chế độ an toàn nếu chưa được bật."
      />

      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-center lg:px-6">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-950 lg:text-4xl">Tổng quan CEO</h1>
          <p className="text-base font-medium leading-7 text-slate-600 lg:text-lg">Dữ liệu vận hành thật của trung tâm hiện tại.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="success" label="Dữ liệu thật" />
          <StatusBadge status="warning" label="Kết nối chờ duyệt" />
        </div>
      </div>

      {attentionItems.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm lg:p-5">
          <div className="mb-3 flex items-center gap-2 text-base font-black text-amber-950">
            <AlertTriangle className="h-5 w-5" /> Việc cần chú ý
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {attentionItems.map((item) => (
              <Link key={item.id} href={item.href} className="flex min-h-12 items-center justify-between gap-4 rounded-lg border border-amber-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 lg:text-base">
                <span>{item.label}</span>
                <span className="text-indigo-600">Xử lý →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard title="Doanh thu tháng này" value={formatMoneyShort(financeSummary.collectedThisMonth)} icon={<Wallet className="h-5 w-5" />} color="primary" />
        <MetricCard title="Khách mới hôm nay" value={newKháchsToday} icon={<UserPlus className="h-5 w-5" />} color="success" />
        <MetricCard title="Việc đang mở" value={openViệcsCount} icon={<ClipboardList className="h-5 w-5" />} color="warning" />
        <MetricCard title="Công nợ cần chú ý" value={formatMoneyShort(financeSummary.totalOverdue)} icon={<BadgeDollarSign className="h-5 w-5" />} color="danger" />
        <MetricCard title="Hóa đơn quá hạn" value={overdueInvoicesCount} icon={<ListTodo className="h-5 w-5" />} color="info" />
        <MetricCard title="Học viên / lớp" value={`${activeStudents}/${activeClasses}`} icon={<School className="h-5 w-5" />} color="default" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 lg:text-2xl"><UserPlus className="h-5 w-5 text-emerald-600" /> Khách mới nhất</h2>
            <Link href="/leads" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Mở danh sách khách →</Link>
          </div>
          <div className="space-y-3">
            {recentKháchs.map((lead) => (
              <div key={lead.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{lead.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{lead.phone || 'Chưa có số điện thoại'} · {formatDateTime(lead.createdAt)}</p>
                  </div>
                  <StatusBadge status={lead.temperature === 'HOT' ? 'danger' : 'neutral'} label={stageLabel(String(lead.stage))} />
                </div>
              </div>
            ))}
            {recentKháchs.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Chưa có khách thật trong tenant.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 lg:text-2xl"><FileClock className="h-5 w-5 text-amber-600" /> Việc chăm sóc gần tới hạn</h2>
            <Link href="/tasks" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Mở việc chăm sóc →</Link>
          </div>
          <div className="space-y-3">
            {recentTaskss.map((việc) => (
              <div key={việc.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{việc.description}</p>
                    <p className="mt-1 text-sm text-slate-500">{việc.lead.name} · {việc.lead.phone || 'chưa có SĐT'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${việc.dueDate < now ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    {việc.dueDate < now ? 'Quá hạn' : formatDateTime(việc.dueDate)}
                  </span>
                </div>
              </div>
            ))}
            {recentTaskss.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Không có việc chăm sóc đang mở.</p>}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 lg:text-2xl"><Inbox className="h-5 w-5 text-indigo-600" /> Phễu tuyển sinh khách tiềm năng</h2>
            <Link href="/crm-command-center" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Mở tuyển sinh →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leadStageCounts.map((stage) => (
              <div key={String(stage.stage)} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/70">
                <p className="text-sm font-semibold text-slate-500">{stageLabel(String(stage.stage))}</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{stage._count._all}</p>
              </div>
            ))}
            {leadStageCounts.length === 0 && <p className="text-sm text-slate-500">Chưa có pipeline lead.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 lg:text-2xl"><Users className="h-5 w-5 text-slate-600" /> Nhân sự trung tâm</h2>
            <Link href="/settings/staff" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Cài đặt →</Link>
          </div>
          <div className="space-y-3">
            {tenantMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{memberDisplayName(member.role, index)}</p>
                  <p className="text-xs text-slate-500">{memberStatusLabel(member.status)}</p>
                </div>
                <StatusBadge status={member.status === 'ACTIVE' ? 'success' : 'neutral'} label={memberRoleLabel(member.role)} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 lg:text-2xl"><History className="h-5 w-5 text-slate-600" /> Hoạt động gần đây</h2>
          <Link href="/settings/audit-log" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Xem lịch sử →</Link>
        </div>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {recentAudits.map((audit) => (
            <div key={audit.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{auditActionLabel(audit.action)}</p>
                <p className="text-sm text-slate-500">{auditEntityLabel(audit.entityType)}</p>
              </div>
              <span className="text-sm text-slate-500">{formatDateTime(audit.createdAt)}</span>
            </div>
          ))}
          {recentAudits.length === 0 && <p className="p-4 text-sm text-slate-500">Chưa có hoạt động nào được ghi nhận.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-purple-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-sm lg:p-6">
        <div className="mb-3 flex items-center gap-2 text-purple-900">
          <Bot className="h-6 w-6" />
          <h2 className="text-xl font-bold">Trợ lý AI đang ở chế độ duyệt trước</h2>
        </div>
        <p className="text-sm font-medium text-slate-600">
          Bảng điều hành không tự bật trả lời tự động hoặc gửi kết nối thật. Mọi tin nháp đều đi qua hàng chờ duyệt và được ghi lịch sử trước khi dùng trong giai đoạn trải nghiệm.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/approval-queue" className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-bold text-white hover:bg-purple-800">Duyệt tin nháp</Link>
          <Link href="/approval-queue" className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50">Xem tin nháp</Link>
        </div>
      </section>
    </div>
  );
}
