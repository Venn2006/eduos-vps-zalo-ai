"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AttendanceStatus } from '@eduos/db';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarX2,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  LayoutDashboard,
  PenTool,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { markAttendance } from '../../actions/teacher';

export type RealSession = {
  id: string;
  className: string;
  teacherName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  startMs: number;
  endMs: number;
  studentCount: number;
  attendances: { id: string; studentId: string; studentName: string; status: string }[];
  attendanceStatus: string;
  homeworkStatus: string;
  assignedHomeworkCount: number;
  missingSubmissionCount: number;
};

export type RealClass = {
  id: string;
  classCode: string;
  courseName: string;
  teacherName: string;
  studentCount: number;
  status: string;
};

export type ApprovalDraft = {
  id: string;
  title: string;
  studentName: string;
  className: string;
  teacherName: string;
  score: number;
  createdAt: string;
  comment: string;
};

type Tab = 'overview' | 'classes' | 'schedule' | 'conflicts' | 'attendance' | 'approval';

type ScheduleConflict = {
  id: string;
  title: string;
  description: string;
  involvedSessions: RealSession[];
};

const DONE_ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function getAttendanceStatusLabel(attendances: RealSession['attendances']) {
  if (attendances.length === 0) return 'Chưa điểm danh';
  return attendances.every((attendance) => DONE_ATTENDANCE_STATUSES.includes(attendance.status)) ? 'Đủ' : 'Thiếu';
}

function ActionCard({
  title,
  metric,
  reason,
  severity = 'info',
  onClick,
}: {
  title: string;
  metric: number | string;
  reason: string;
  severity?: 'success' | 'warning' | 'critical' | 'info';
  onClick: () => void;
}) {
  const colorMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    critical: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    warning: <Clock className="h-5 w-5 text-amber-500" />,
    critical: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    info: <Sparkles className="h-5 w-5 text-blue-500" />,
  };

  return (
    <button
      type="button"
      className={`flex min-h-40 flex-col rounded-xl border p-5 text-left shadow-sm transition-all hover:shadow-md ${colorMap[severity]}`}
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight opacity-80">{title}</h3>
        {iconMap[severity]}
      </div>
      <div className="mb-3 text-3xl font-black">{metric}</div>
      <p className="flex-1 text-sm leading-snug opacity-75">{reason}</p>
      <div className="mt-3 flex items-center justify-end gap-1 border-t border-black/5 pt-2 text-xs font-semibold opacity-60">
        Xem chi tiết <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

function SafetyBanner() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-100 p-3 text-sm font-medium text-amber-800">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <div>
        <strong>Dữ liệu lớp học là dữ liệu thật trong tenant.</strong> Các tin nhắn phát sinh từ điểm danh vắng/trễ chỉ vào
        hàng chờ duyệt, chưa gửi Zalo thật.
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
  tone?: 'default' | 'danger' | 'ai';
  onClick: (tab: Tab) => void;
}) {
  const activeClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
      : tone === 'ai'
        ? 'bg-indigo-700 text-white border-indigo-700 shadow-md'
        : 'bg-slate-900 text-white border-slate-900 shadow-md';

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

export function TeacherWorkspaceClient({
  initialClasses,
  initialSessions,
  initialApprovalDrafts,
}: {
  initialClasses: RealClass[];
  initialSessions: RealSession[];
  initialApprovalDrafts: ApprovalDraft[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sessions, setSessions] = useState<RealSession[]>(initialSessions);
  const [isUpdating, setIsUpdating] = useState(false);

  const conflicts = useMemo(() => detectTeacherConflicts(sessions), [sessions]);
  const missingAttendance = sessions.filter((session) => session.attendanceStatus !== 'Đủ').length;
  const missingHomework = sessions.reduce((total, session) => total + session.missingSubmissionCount, 0);
  const pendingApprovals = initialApprovalDrafts.length;

  const handleMarkAttendance = async (attendanceId: string, status: AttendanceStatus) => {
    try {
      setIsUpdating(true);
      await markAttendance(attendanceId, status);
      toast.success('Đã cập nhật điểm danh. Nếu vắng/trễ, hệ thống đã tạo nháp hàng chờ duyệt.');
      setSessions((previous) =>
        previous.map((session) => {
          const attendances = session.attendances.map((attendance) =>
            attendance.id === attendanceId ? { ...attendance, status } : attendance,
          );

          return {
            ...session,
            attendances,
            attendanceStatus: getAttendanceStatusLabel(attendances),
          };
        }),
      );
    } catch {
      toast.error('Có lỗi xảy ra khi điểm danh.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabButton activeTab={activeTab} icon={<LayoutDashboard className="h-4 w-4" />} label="Tổng quan" tab="overview" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={initialClasses.length} icon={<BookOpen className="h-4 w-4" />} label="Lớp học" tab="classes" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={sessions.length} icon={<Calendar className="h-4 w-4" />} label="Lịch hôm nay" tab="schedule" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={conflicts.length} icon={<CalendarX2 className="h-4 w-4" />} label="Trùng lịch" tab="conflicts" tone="danger" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} icon={<ClipboardList className="h-4 w-4" />} label="Điểm danh & Bài tập" tab="attendance" onClick={setActiveTab} />
        <TabButton activeTab={activeTab} count={pendingApprovals} icon={<PenTool className="h-4 w-4" />} label="Cần duyệt" tab="approval" tone="ai" onClick={setActiveTab} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-800 p-8 text-white shadow-lg">
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-black tracking-tight">
                <GraduationCap className="h-8 w-8 opacity-80" /> Học vụ & Giảng dạy hôm nay
              </h1>
              <p className="mb-6 max-w-2xl text-lg leading-relaxed text-indigo-100">
                Tập trung vào lớp cần điểm danh, bài tập còn thiếu và bản chấm nháp AI cần giáo viên duyệt.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/homework" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 transition-colors hover:bg-white/20">
                  <BookOpen className="h-4 w-4" /> Xem bài tập
                </Link>
                <Link href="/approval-queue" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 transition-colors hover:bg-white/20">
                  <CheckCircle2 className="h-4 w-4" /> Hàng đợi duyệt
                </Link>
              </div>
            </div>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">Việc cần xử lý hôm nay</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ActionCard title="Cần điểm danh" metric={missingAttendance} severity={missingAttendance > 0 ? 'warning' : 'success'} reason="Số ca học hôm nay chưa hoàn tất điểm danh." onClick={() => setActiveTab('attendance')} />
                <ActionCard title="Giáo viên cần duyệt" metric={pendingApprovals} severity={pendingApprovals > 0 ? 'warning' : 'success'} reason="Bản chấm nháp AI đang chờ giáo viên xác nhận." onClick={() => setActiveTab('approval')} />
                <ActionCard title="Trùng lịch" metric={conflicts.length} severity={conflicts.length > 0 ? 'critical' : 'success'} reason="Trùng giáo viên trong lịch học thật hôm nay." onClick={() => setActiveTab('conflicts')} />
                <ActionCard title="Bài thiếu" metric={missingHomework} severity={missingHomework > 0 ? 'info' : 'success'} reason="Số lượt học viên chưa nộp đủ bài đã giao." onClick={() => setActiveTab('attendance')} />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
              <BookOpen className="h-6 w-6 text-indigo-600" /> Lớp học của tôi
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {initialClasses.length === 0 ? (
                <div className="col-span-full text-slate-500">Chưa có lớp học trong tenant này.</div>
              ) : (
                initialClasses.map((classItem) => (
                  <div key={classItem.id} className="flex h-full flex-col rounded-xl border bg-slate-50/50 p-5 transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-700">{classItem.classCode}</h3>
                        <p className="mt-1 text-sm text-slate-500">{classItem.courseName}</p>
                      </div>
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{classItem.status}</span>
                    </div>
                    <div className="mt-auto space-y-3 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex items-center justify-between"><span className="flex items-center text-slate-600"><Users className="mr-2 h-4 w-4" /> Học viên</span><span className="font-semibold text-slate-900">{classItem.studentCount}</span></div>
                      <div className="flex items-center justify-between"><span className="flex items-center text-slate-600"><PenTool className="mr-2 h-4 w-4" /> Giáo viên</span><span className="font-semibold text-slate-900">{classItem.teacherName}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <SessionList sessions={sessions} onOpenAttendance={() => setActiveTab('attendance')} />
        )}

        {activeTab === 'conflicts' && (
          <ConflictList conflicts={conflicts} />
        )}

        {activeTab === 'attendance' && (
          <AttendanceList sessions={sessions} isUpdating={isUpdating} onMarkAttendance={handleMarkAttendance} />
        )}

        {activeTab === 'approval' && (
          <ApprovalList drafts={initialApprovalDrafts} />
        )}
      </div>
    </div>
  );
}

function SessionList({ sessions, onOpenAttendance }: { sessions: RealSession[]; onOpenAttendance: () => void }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900">Lịch dạy hôm nay</h2>
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="font-medium text-slate-500">Không có ca dạy nào trong hôm nay.</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex flex-col gap-4 rounded-xl border p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center">
              <div className="flex w-full shrink-0 items-center justify-between sm:block sm:w-24 sm:text-center">
                <div className="text-lg font-black text-slate-900">{session.startTime}</div>
                <div className="text-sm font-medium text-slate-500">{session.endTime}</div>
              </div>
              <div className="hidden h-12 w-px shrink-0 bg-slate-200 sm:block" />
              <div className="w-full flex-1">
                <h3 className="text-lg font-bold text-slate-900">{session.className}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1 font-medium"><Users className="h-4 w-4" /> {session.studentCount} hv</span>
                  <span className="flex items-center gap-1 font-medium"><PenTool className="h-4 w-4" /> {session.teacherName}</span>
                  <span className="flex items-center gap-1 font-medium"><CheckCircle2 className="h-4 w-4" /> {session.roomName}</span>
                </div>
              </div>
              <button type="button" onClick={onOpenAttendance} className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100 sm:w-auto">
                Điểm danh
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ConflictList({ conflicts }: { conflicts: ScheduleConflict[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Danh sách trùng lịch</h2>
        {conflicts.length === 0 && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-600">Không phát hiện trùng giáo viên hôm nay</span>}
      </div>
      {conflicts.map((conflict) => (
        <div key={conflict.id} className="rounded-2xl border border-rose-300 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-black text-slate-900">{conflict.title}</h3>
          <p className="mb-4 font-medium text-slate-600">{conflict.description}</p>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {conflict.involvedSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm">
                <span className="font-bold text-slate-900">{session.className} <span className="ml-2 font-medium text-slate-500">({session.startTime} - {session.endTime})</span></span>
                <span className="font-medium text-slate-600">Giáo viên: {session.teacherName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceList({
  sessions,
  isUpdating,
  onMarkAttendance,
}: {
  sessions: RealSession[];
  isUpdating: boolean;
  onMarkAttendance: (attendanceId: string, status: AttendanceStatus) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900">Quản lý điểm danh & bài tập</h2>
      {sessions.length === 0 ? (
        <div className="font-medium text-slate-500">Không có dữ liệu điểm danh hôm nay.</div>
      ) : (
        <div className="space-y-8">
          {sessions.map((session) => (
            <div key={session.id} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-indigo-700">{session.className}</h3>
                  <p className="text-sm text-slate-500">{session.startTime} - {session.endTime}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <StatusPill label="Điểm danh" value={session.attendanceStatus} goodValue="Đủ" />
                  <StatusPill label="Bài tập" value={session.homeworkStatus} goodValue="Đủ bài" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-white">
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">Học viên</th>
                      <th className="px-4 py-3 text-center">Có mặt</th>
                      <th className="px-4 py-3 text-center">Đi trễ</th>
                      <th className="px-4 py-3 text-center">Vắng có phép</th>
                      <th className="px-4 py-3 text-center">Vắng không phép</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-800">
                    {session.attendances.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-4 text-center italic text-slate-500">Chưa có bản ghi điểm danh cho ca này.</td></tr>
                    ) : (
                      session.attendances.map((attendance) => (
                        <tr key={attendance.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{attendance.studentName}</td>
                          <AttendanceButton status="PRESENT" currentStatus={attendance.status} isUpdating={isUpdating} onClick={() => onMarkAttendance(attendance.id, 'PRESENT')} />
                          <AttendanceButton status="LATE" currentStatus={attendance.status} isUpdating={isUpdating} onClick={() => onMarkAttendance(attendance.id, 'LATE')} />
                          <AttendanceButton status="EXCUSED" currentStatus={attendance.status} isUpdating={isUpdating} onClick={() => onMarkAttendance(attendance.id, 'EXCUSED')} />
                          <AttendanceButton status="ABSENT" currentStatus={attendance.status} isUpdating={isUpdating} onClick={() => onMarkAttendance(attendance.id, 'ABSENT')} />
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalList({ drafts }: { drafts: ApprovalDraft[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <CheckCircle2 className="h-6 w-6 text-indigo-600" /> Bản chấm nháp AI cần duyệt
      </h2>
      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-800">Không có bản chấm nháp AI nào đang chờ duyệt.</div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="flex flex-col justify-between gap-4 rounded-xl border p-5 transition-shadow hover:shadow-md md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Cần giáo viên duyệt</span>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{draft.score}/10</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{draft.studentName} - {draft.title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-600">Lớp: {draft.className} - Phụ trách: {draft.teacherName} - {draft.createdAt}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{draft.comment}</p>
              </div>
              <Link href="/homework" className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800 md:w-auto">
                Mở module bài tập
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, value, goodValue }: { label: string; value: string; goodValue: string }) {
  const isGood = value === goodValue;
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
      {label}: {value}
    </span>
  );
}

function AttendanceButton({
  currentStatus,
  isUpdating,
  onClick,
  status,
}: {
  currentStatus: string;
  isUpdating: boolean;
  onClick: () => void;
  status: AttendanceStatus;
}) {
  const active = currentStatus === status;
  const colorClass =
    status === 'PRESENT'
      ? 'border-emerald-500 bg-emerald-500'
      : status === 'LATE'
        ? 'border-orange-500 bg-orange-500'
        : status === 'EXCUSED'
          ? 'border-blue-500 bg-blue-500'
          : 'border-rose-500 bg-rose-500';

  return (
    <td className="px-4 py-3 text-center">
      <button
        type="button"
        disabled={isUpdating || active}
        onClick={onClick}
        className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
          active ? `${colorClass} text-white` : 'border-slate-300 text-transparent hover:border-slate-500'
        }`}
        aria-label={status}
      >
        {active && <CheckCircle2 className="h-4 w-4" />}
      </button>
    </td>
  );
}

function detectTeacherConflicts(sessions: RealSession[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let leftIndex = 0; leftIndex < sessions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < sessions.length; rightIndex += 1) {
      const left = sessions[leftIndex];
      const right = sessions[rightIndex];
      const hasTeacher = left.teacherName !== 'Chưa phân công' && right.teacherName !== 'Chưa phân công';
      const sameTeacher = left.teacherName === right.teacherName;
      const overlap = left.startMs < right.endMs && right.startMs < left.endMs;

      if (hasTeacher && sameTeacher && overlap) {
        conflicts.push({
          id: `${left.id}-${right.id}`,
          title: `Trùng giáo viên ${left.teacherName}`,
          description: `${left.className} và ${right.className} bị xếp chồng thời gian trong lịch hôm nay.`,
          involvedSessions: [left, right],
        });
      }
    }
  }

  return conflicts;
}
