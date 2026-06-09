import React from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  CheckSquare,
  Clock,
  CreditCard,
  FileEdit,
  Lock,
  MessageSquare,
  Settings2,
  Users,
  Zap,
} from 'lucide-react';
import { prisma } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { cn } from '@/lib/utils';

const BLUEPRINTS = [
  { id: 'class-reminder', title: 'Nhắc lịch học trước giờ vào lớp', category: 'Lớp học', trigger: 'Trước lịch học theo số phút cấu hình', modules: ['Buổi học', 'Hàng chờ duyệt'], icon: <Clock className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-50' },
  { id: 'attendance', title: 'Điểm danh và báo vắng/trễ', category: 'Điểm danh', trigger: 'Giáo viên cập nhật điểm danh', modules: ['Attendance', 'Hàng chờ duyệt'], icon: <CheckSquare className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-50' },
  { id: 'teacher-homework', title: 'Nhắc giáo viên giao bài sau buổi học', category: 'Học vụ', trigger: 'Sau giờ kết thúc lớp', modules: ['Bài tập', 'Giáo viên'], icon: <FileEdit className="h-5 w-5 text-teal-500" />, bg: 'bg-teal-50' },
  { id: 'homework-submit', title: 'Theo dõi học viên nộp bài', category: 'Học vụ', trigger: 'Trước/sau hạn nộp bài', modules: ['Bài nộp', 'Báo cáo'], icon: <MessageSquare className="h-5 w-5 text-orange-500" />, bg: 'bg-orange-50' },
  { id: 'ai-grade', title: 'AI chấm nháp bài tập', category: 'AI', trigger: 'Có bài nộp mới', modules: ['Nháp chấm bài AI', 'Giáo viên duyệt'], icon: <BrainCircuit className="h-5 w-5 text-fuchsia-500" />, bg: 'bg-fuchsia-50' },
  { id: 'parent-report', title: 'Báo cáo phụ huynh cuối tuần', category: 'Báo cáo', trigger: 'Lịch tuần', modules: ['Báo cáo phụ huynh', 'Duyệt trước'], icon: <Users className="h-5 w-5 text-indigo-500" />, bg: 'bg-indigo-50' },
  { id: 'payment-reminder', title: 'Nhắc học phí trước/quá hạn', category: 'Tài chính', trigger: 'Ngày đến hạn hóa đơn', modules: ['Hóa đơn', 'Hàng chờ duyệt'], icon: <CreditCard className="h-5 w-5 text-rose-500" />, bg: 'bg-rose-50' },
  { id: 'class-setup', title: 'Cấu hình nhóm lớp bằng lệnh /setup', category: 'Cấu hình', trigger: 'Khi có lệnh cấu hình lớp', modules: ['Nhóm Zalo', 'Cấu hình tự động theo lớp'], icon: <Zap className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-50' },
];

const templateDisplayName = (name: string) => {
  const labels: Record<string, string> = {
    standard: 'Mẫu tiêu chuẩn',
    kids: 'Mẫu lớp thiếu nhi',
    'adult-communication': 'Mẫu giao tiếp người lớn',
  };

  return labels[name] || name.replace(/[-_]/g, ' ');
};

const commandStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Đã hoàn tất',
    FAILED: 'Có lỗi',
  };

  return labels[status] || 'Cần kiểm tra';
};

export default async function WorkflowTemplatesPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/workflow-templates')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const [templates, settings, bootstrapCommands, outboxReady] = await Promise.all([
    prisma.classAutomationTemplate.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } }),
    prisma.classAutomationSetting.findMany({
      where: { tenantId },
      include: { class: true, template: true },
      orderBy: { class: { classCode: 'asc' } },
    }),
    prisma.classBootstrapCommand.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: 'MOCK_READY' } }),
  ]);

  const activeSettings = settings.filter((setting) =>
    setting.classReminderEnabled ||
    setting.attendanceEnabled ||
    setting.teacherHomeworkReminderEnabled ||
    setting.homeworkSubmissionEnabled ||
    setting.rewardEnabled ||
    setting.paymentReminderGroupEnabled,
  );

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Tự động hóa quy trình"
        description="Trạng thái tự động hóa thật theo trung tâm. Các mẫu bên dưới là gợi ý vận hành, chưa tự cài đặt khi bấm."
        action={
          <Link href="/approval-queue" className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Mở Hàng chờ duyệt
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Mẫu đã lưu" value={templates.length} />
        <MetricCard label="Lớp đã cấu hình" value={settings.length} />
        <MetricCard label="Tự động đang bật" value={activeSettings.length} />
        <MetricCard label="Nháp chờ duyệt" value={outboxReady} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <h2 className="font-bold text-slate-900">Mẫu tự động đang lưu</h2>
          <p className="mt-1 text-sm text-slate-500">Các mẫu này được dùng khi cấu hình tự động hóa cho lớp.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {templates.length === 0 ? (
            <div className="p-5 text-sm font-medium text-slate-500">Chưa có mẫu tự động hóa trong trung tâm này.</div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h3 className="font-bold text-slate-900">{templateDisplayName(template.name)}</h3>
                  <p className="mt-1 text-sm text-slate-500">Cập nhật: {template.updatedAt.toLocaleString('vi-VN')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Flag enabled={template.classReminderEnabled} label={`Nhắc lớp ${template.classReminderMinutesBefore}p`} />
                    <Flag enabled={template.attendanceEnabled} label="Điểm danh" />
                    <Flag enabled={template.aiGradingEnabled} label="AI chấm nháp" />
                    <Flag enabled={template.weeklyParentReportEnabled} label="Báo cáo tuần" />
                    <Flag enabled={template.paymentReminderEnabled} label="Nhắc phí" />
                    <Flag enabled={template.sensitiveMessagesRequireApproval} label="Tin nhạy cảm cần duyệt" />
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  Cần duyệt trước
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <h2 className="font-bold text-slate-900">Cấu hình theo lớp</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {settings.length === 0 ? (
            <div className="p-5 text-sm font-medium text-slate-500">Chưa có lớp nào gắn cấu hình tự động.</div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{setting.class.classCode}</h3>
                  <p className="text-sm text-slate-500">Mẫu: {templateDisplayName(setting.template.name)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Flag enabled={setting.classReminderEnabled} label="Nhắc lớp" />
                  <Flag enabled={setting.attendanceEnabled} label="Điểm danh" />
                  <Flag enabled={setting.teacherHomeworkReminderEnabled} label="Nhắc giáo viên" />
                  <Flag enabled={setting.homeworkSubmissionEnabled} label="Bài nộp" />
                  <Flag enabled={setting.paymentReminderGroupEnabled} label="Nhắc phí nhóm" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mẫu tham khảo đang khóa</h2>
            <p className="text-sm text-slate-500">Các mẫu dưới đây chỉ mô tả khả năng. Muốn mở cần thêm thao tác cấu hình và ghi lịch sử.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BLUEPRINTS.map((template) => (
            <Card key={template.id} className="flex flex-col border-border shadow-sm">
              <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', template.bg)}>{template.icon}</div>
                  <div>
                    <CardTitle className="text-base font-bold leading-tight text-slate-800">{template.title}</CardTitle>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{template.category}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <div className="mb-5 space-y-3">
                  <Info label="Kích hoạt" value={template.trigger} />
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-400">Phần liên kết</p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.modules.map((module) => (
                        <span key={module} className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{module}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Chưa tự bật trong giai đoạn trải nghiệm</span>
                  <Settings2 className="h-4 w-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <h2 className="font-bold text-slate-900">Lệnh cấu hình gần đây</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {bootstrapCommands.length === 0 ? (
            <div className="p-5 text-sm font-medium text-slate-500">Chưa có lệnh cấu hình lớp nào.</div>
          ) : (
            bootstrapCommands.map((command) => (
              <div key={command.id} className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-slate-900">{command.classCode}</p>
                  <p className="text-sm text-slate-500">Nhóm: {command.externalGroupId} - {command.createdAt.toLocaleString('vi-VN')}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{commandStatusLabel(command.status)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Flag({ enabled, label }: { enabled: boolean; label: string }) {
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{label}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}:</span>
      <span className="text-right font-semibold text-slate-700">{value}</span>
    </div>
  );
}
