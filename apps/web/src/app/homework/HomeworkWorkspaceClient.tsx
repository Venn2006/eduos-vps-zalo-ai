"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  LayoutDashboard,
  Lock,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { approveAiGradeDraft, approveWeeklyParentReport } from '../actions/homework';

export type HomeworkRow = {
  id: string;
  title: string;
  className: string;
  teacherName: string;
  dueAt: string;
  status: string;
  submissionCount: number;
  expectedSubmissions: number;
  missingSubmissionCount: number;
  latestAiDraftStatus: string;
};

export type SubmissionRow = {
  id: string;
  studentName: string;
  className: string;
  homeworkTitle: string;
  submittedAt: string;
  status: string;
  aiDraftStatus: string;
  aiScore: number | null;
};

export type DraftRow = {
  id: string;
  studentName: string;
  className: string;
  teacherName: string;
  homeworkTitle: string;
  score: number;
  comment: string;
  createdAt: string;
};

export type ReportRow = {
  id: string;
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  className: string;
  status: string;
  weekRange: string;
  draftContent: string;
};

type Tab = 'overview' | 'ai-draft' | 'generator' | 'parent-report';

function SafetyBanner() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-100 p-3 text-sm font-medium text-amber-800">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <div>
        <strong>Luồng học vụ đang chạy bằng dữ liệu thật.</strong> Duyệt điểm và duyệt báo cáo có ghi DB/audit; gửi tin nhắn phụ huynh vẫn bị khóa duyệt trước.
      </div>
    </div>
  );
}

function TabButton({
  activeTab,
  count,
  icon,
  label,
  tab,
  tone = 'default',
  onClick,
}: {
  activeTab: Tab;
  count?: number;
  icon: React.ReactNode;
  label: string;
  tab: Tab;
  tone?: 'default' | 'ai';
  onClick: (tab: Tab) => void;
}) {
  const activeClass = tone === 'ai' ? 'bg-indigo-700 text-white border-indigo-700 shadow-md' : 'bg-slate-900 text-white border-slate-900 shadow-md';
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
        activeTab === tab ? activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
      {typeof count === 'number' && count > 0 && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-900">{count}</span>
      )}
    </button>
  );
}

export function HomeworkWorkspaceClient({
  homeworkRows,
  submissionRows,
  draftRows,
  reportRows,
}: {
  homeworkRows: HomeworkRow[];
  submissionRows: SubmissionRow[];
  draftRows: DraftRow[];
  reportRows: ReportRow[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const missingHomeworks = homeworkRows.reduce((total, homework) => total + homework.missingSubmissionCount, 0);

  const handleApproveDraft = (draftId: string) => {
    startTransition(async () => {
      try {
        await approveAiGradeDraft(draftId);
        toast.success('Đã duyệt bản chấm nháp và cập nhật trạng thái bài nộp.');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể duyệt bản chấm nháp.');
      }
    });
  };

  const handleApproveReport = (reportId: string) => {
    startTransition(async () => {
      try {
        await approveWeeklyParentReport(reportId);
        toast.success('Đã duyệt báo cáo phụ huynh. Chưa gửi tin nhắn thật.');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể duyệt báo cáo.');
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabButton activeTab={activeTab} icon={<LayoutDashboard className="h-4 w-4" />} label="Tổng quan" tab="overview" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={draftRows.length} icon={<Sparkles className="h-4 w-4" />} label="AI chấm nháp" tab="ai-draft" tone="ai" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} icon={<PenTool className="h-4 w-4" />} label="Tạo học liệu" tab="generator" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={reportRows.length} icon={<BookOpen className="h-4 w-4" />} label="Báo cáo phụ huynh" tab="parent-report" onClick={setActiveTab} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <OverviewPanel
            homeworkRows={homeworkRows}
            submissionRows={submissionRows}
            draftCount={draftRows.length}
            missingHomeworks={missingHomeworks}
            reportCount={reportRows.length}
          />
        )}

        {activeTab === 'ai-draft' && (
          <AiDraftPanel drafts={draftRows} isPending={isPending} onApprove={handleApproveDraft} />
        )}

        {activeTab === 'generator' && <GeneratorLockedPanel />}

        {activeTab === 'parent-report' && (
          <ParentReportPanel reports={reportRows} isPending={isPending} onApprove={handleApproveReport} />
        )}
      </div>
    </div>
  );
}

function OverviewPanel({
  draftCount,
  homeworkRows,
  missingHomeworks,
  reportCount,
  submissionRows,
}: {
  draftCount: number;
  homeworkRows: HomeworkRow[];
  missingHomeworks: number;
  reportCount: number;
  submissionRows: SubmissionRow[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Bài đã giao" value={homeworkRows.length} />
        <MetricCard label="Bài nộp" value={submissionRows.length} />
        <MetricCard label="Bài thiếu" value={missingHomeworks} tone={missingHomeworks > 0 ? 'warning' : 'success'} />
        <MetricCard label="AI/báo cáo cần duyệt" value={draftCount + reportCount} tone={draftCount + reportCount > 0 ? 'warning' : 'success'} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Danh sách bài tập đã giao</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-sm font-bold text-slate-500">
                <th className="whitespace-nowrap px-6 py-3">Bài tập / Lớp</th>
                <th className="whitespace-nowrap px-6 py-3">Giáo viên</th>
                <th className="whitespace-nowrap px-6 py-3">Hạn nộp</th>
                <th className="whitespace-nowrap px-6 py-3">Nộp bài</th>
                <th className="whitespace-nowrap px-6 py-3">AI</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-800">
              {homeworkRows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có bài tập nào trong DB.</td></tr>
              ) : (
                homeworkRows.map((homework) => (
                  <tr key={homework.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-bold text-slate-900">{homework.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{homework.className} - {homework.status}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{homework.teacherName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{homework.dueAt}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusPill value={`${homework.submissionCount}/${homework.expectedSubmissions}`} tone={homework.missingSubmissionCount > 0 ? 'warning' : 'success'} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4"><StatusPill value={homework.latestAiDraftStatus} tone={homework.latestAiDraftStatus === 'Chờ giáo viên duyệt' ? 'warning' : 'default'} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Bài nộp gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-sm font-bold text-slate-500">
                <th className="whitespace-nowrap px-6 py-3">Học viên / Lớp</th>
                <th className="whitespace-nowrap px-6 py-3">Bài tập</th>
                <th className="whitespace-nowrap px-6 py-3">Nộp lúc</th>
                <th className="whitespace-nowrap px-6 py-3">Trạng thái</th>
                <th className="whitespace-nowrap px-6 py-3">Điểm AI</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-800">
              {submissionRows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chưa có bài nộp trong DB.</td></tr>
              ) : (
                submissionRows.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4"><div className="font-bold text-slate-900">{submission.studentName}</div><div className="mt-1 text-xs text-slate-500">{submission.className}</div></td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700">{submission.homeworkTitle}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{submission.submittedAt}</td>
                    <td className="whitespace-nowrap px-6 py-4"><StatusPill value={submission.status} tone="default" /></td>
                    <td className="whitespace-nowrap px-6 py-4">{submission.aiScore === null ? 'Chưa có' : `${submission.aiScore}/10`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AiDraftPanel({ drafts, isPending, onApprove }: { drafts: DraftRow[]; isPending: boolean; onApprove: (draftId: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 text-indigo-600" />
        <div>
          <h4 className="font-bold text-indigo-900">AI chỉ chấm nháp</h4>
          <p className="mt-1 text-sm text-indigo-800">Giáo viên duyệt thì hệ thống mới cập nhật trạng thái bài nộp và tạo audit log. Không gửi tin nhắn ra ngoài.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 font-medium text-emerald-800">Không có bản chấm nháp nào đang chờ duyệt.</div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">TEACHER_APPROVAL_REQUIRED</span>
                    <span className="text-xs font-medium text-slate-500">{draft.createdAt}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{draft.studentName} - {draft.homeworkTitle}</h3>
                  <p className="text-sm font-medium text-slate-600">Lớp: {draft.className} - Phụ trách: {draft.teacherName}</p>
                </div>
                <div className="text-left md:text-center">
                  <div className="text-3xl font-black text-emerald-600">{draft.score}/10</div>
                  <div className="text-xs font-bold text-slate-400">ĐIỂM NHÁP</div>
                </div>
              </div>
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-2 text-sm font-bold text-slate-700">Nhận xét AI đề xuất</h4>
                <p className="text-sm italic text-slate-900">{draft.comment}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={isPending} onClick={() => onApprove(draft.id)} className="bg-slate-900 font-bold text-white hover:bg-slate-800">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt & lưu thật
                </Button>
                <span className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                  Muốn sửa: giáo viên chỉnh trong nhận xét trước khi duyệt
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GeneratorLockedPanel() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Lock className="mt-0.5 h-5 w-5 text-slate-600" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tạo học liệu AI đang khóa trong gói pilot</h2>
          <p className="mt-1 text-sm text-slate-600">Không còn tạo quiz bằng dữ liệu mẫu trên màn hình khách. Khi mở tính năng này cần nối LLM, lưu version bài tạo và có bước giáo viên duyệt.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LockedFeature title="Sinh quiz" description="Cần backend lưu bài sinh ra và chi phí token." />
        <LockedFeature title="Sinh bài điền từ" description="Cần kho passage thật theo lớp/CEFR." />
        <LockedFeature title="Lưu nháp học liệu" description="Cần workflow duyệt trước khi giao cho học viên." />
      </div>
    </div>
  );
}

function ParentReportPanel({ reports, isPending, onApprove }: { reports: ReportRow[]; isPending: boolean; onApprove: (reportId: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Eye className="mt-0.5 h-5 w-5 text-amber-600" />
        <div>
          <h4 className="font-bold text-amber-900">Báo cáo phụ huynh chỉ duyệt nội dung</h4>
          <p className="mt-1 text-sm text-amber-800">Nút duyệt cập nhật DB thật. Gửi Zalo/Facebook vẫn khóa để tránh gửi nhầm trong pilot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 font-medium text-emerald-800 md:col-span-2">Không có báo cáo phụ huynh nào đang chờ duyệt.</div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="absolute right-4 top-4">
                <span className="rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">Not sent</span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900">{report.studentName}</h3>
              <div className="mb-4 text-sm text-slate-500">{report.guardianName} - {report.guardianPhone}</div>
              <div className="mb-4 space-y-2 text-sm">
                <InfoRow label="Lớp" value={report.className} />
                <InfoRow label="Tuần" value={report.weekRange} />
                <InfoRow label="Trạng thái" value={report.status} />
              </div>
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-slate-500">Nội dung nháp</div>
                <p className="line-clamp-6 text-sm italic text-slate-800">{report.draftContent}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={isPending} onClick={() => onApprove(report.id)} className="bg-slate-900 font-bold text-white hover:bg-slate-800">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt báo cáo
                </Button>
                <span className="inline-flex h-10 items-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800">
                  Gửi thật đang khóa, chỉ lưu trạng thái duyệt
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' | 'success' }) {
  const toneClass = tone === 'warning' ? 'text-amber-700' : tone === 'success' ? 'text-emerald-700' : 'text-slate-900';
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 text-sm font-bold text-slate-500">{label}</div>
      <div className={`text-3xl font-black ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusPill({ value, tone = 'default' }: { value: string; tone?: 'default' | 'warning' | 'success' }) {
  const toneClass = tone === 'warning' ? 'bg-amber-100 text-amber-800' : tone === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass}`}>{value}</span>;
}

function LockedFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 font-bold text-slate-900"><Clock className="h-4 w-4 text-slate-500" /> {title}</div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-600">{label}:</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
