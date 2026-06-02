import React from 'react';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { prisma } from '@eduos/db';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Clock, Users, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Reusable Action Card tailored for Vietnamese language centers
function ActionCard({ 
  title, 
  metric, 
  reason, 
  severity = "info", 
  ctaText, 
  ctaHref 
}: { 
  title: string, 
  metric: number | string, 
  reason: string, 
  severity?: "success" | "warning" | "critical" | "info",
  ctaText: string,
  ctaHref: string
}) {
  const colorMap = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <Clock className="w-5 h-5 text-amber-500" />,
    critical: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Sparkles className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className={`flex flex-col p-5 rounded-xl border ${colorMap[severity]} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm tracking-tight opacity-80">{title}</h3>
        {iconMap[severity]}
      </div>
      <div className="text-3xl font-black mb-3">
        {metric}
      </div>
      <p className="text-sm opacity-75 flex-1 mb-5 leading-snug">
        {reason}
      </p>
      <Link href={ctaHref} className="mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-white/60 hover:bg-white text-sm font-bold py-2 rounded-lg border border-white/40 transition-colors shadow-sm">
          {ctaText} <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  );
}

// Visual AI Prompt pill
function AiPrompt({ text }: { text: string }) {
  return (
    <Link href={`/ai-center?prompt=${encodeURIComponent(text)}`} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-indigo-100 text-sm font-medium rounded-full border border-white/10 cursor-pointer">
      <Sparkles className="w-4 h-4 text-indigo-300" />
      "{text}"
    </Link>
  );
}

export default async function TeacherWorkspacePage() {
  const authSession = await getSession();

  // strict RBAC check
  if (!canAccessRoute(authSession?.role, "/workspaces/teacher")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  // Date boundaries for "Today"
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfYesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

  // Queries using Tenant-scope
  const [
    classesToday,
    pendingAttendanceToday,
    unreviewedHomework,
    newSubmissions24h,
  ] = await Promise.all([
    // Lớp hôm nay
    prisma.classSession.count({
      where: {
        tenantId,
        startTime: { gte: startOfDay, lte: endOfDay }
      }
    }),
    // Lớp chưa điểm danh (có attendance = NEEDS_REVIEW)
    prisma.classSession.count({
      where: {
        tenantId,
        startTime: { gte: startOfDay, lte: endOfDay },
        attendances: { some: { status: "NEEDS_REVIEW" } }
      }
    }),
    // Bài tập chưa chấm
    prisma.homeworkSubmission.count({
      where: {
        tenantId,
        status: "SUBMITTED"
      }
    }),
    // Bài nộp mới (24h qua)
    prisma.homeworkSubmission.count({
      where: {
        tenantId,
        submittedAt: { gte: startOfYesterday }
      }
    })
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 opacity-80" />
            Tổng quan Giáo vụ hôm nay
          </h1>
          <p className="text-indigo-100 max-w-2xl text-lg mb-6 leading-relaxed">
            Tập trung vào lớp cần điểm danh, bài tập cần chấm và học viên cần chú ý.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            <AiPrompt text="Lớp nào chưa điểm danh hôm nay?" />
            <AiPrompt text="Bài tập nào chưa chấm?" />
            <AiPrompt text="Học viên nào vắng nhiều gần đây?" />
            <AiPrompt text="Có học viên nào cần báo phụ huynh không?" />
            <AiPrompt text="Soạn nhận xét học tập cho lớp hôm nay" />
          </div>
        </div>
      </div>

      <div className="px-2 space-y-12">
        {/* KPI SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">📊 Chỉ số vận hành lớp</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <ActionCard 
              title="Lớp hôm nay"
              metric={classesToday}
              severity="info"
              reason="Tổng số ca học diễn ra trong ngày hôm nay."
              ctaText="Xem Lịch dạy"
              ctaHref="/classes"
            />
            <ActionCard 
              title="Lớp chưa điểm danh"
              metric={pendingAttendanceToday}
              severity={pendingAttendanceToday > 0 ? "warning" : "success"}
              reason="Số ca học cần hoàn thành điểm danh."
              ctaText="Điểm danh"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Bài tập chưa chấm"
              metric={unreviewedHomework}
              severity={unreviewedHomework > 0 ? "warning" : "success"}
              reason="Số bài nộp chờ giáo viên chấm điểm."
              ctaText="Chấm bài"
              ctaHref="/homework"
            />
            <ActionCard 
              title="Bài nộp mới (24h)"
              metric={newSubmissions24h}
              severity="info"
              reason="Số lượng bài tập học viên nộp gần đây."
              ctaText="Xem Bài tập"
              ctaHref="/homework"
            />
            <ActionCard 
              title="Học viên vắng gần đây"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Cần thêm thời gian thu thập dữ liệu đi học."
              ctaText="Xem Học viên"
              ctaHref="/students"
            />
          </div>
        </section>

        {/* ACTION SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🔥 Việc cần làm ngay</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <ActionCard 
              title="Lớp cần điểm danh"
              metric={pendingAttendanceToday}
              severity={pendingAttendanceToday > 0 ? "critical" : "success"}
              reason="Tránh quên điểm danh sau giờ học."
              ctaText="Điểm danh"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Bài tập cần chấm"
              metric={unreviewedHomework}
              severity={unreviewedHomework > 0 ? "warning" : "success"}
              reason="Phụ huynh đang chờ kết quả bài làm."
              ctaText="Chấm bài"
              ctaHref="/homework"
            />
            <ActionCard 
              title="Bài nộp chờ AI duyệt"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Chờ AI chấm điểm tự động."
              ctaText="Xem Bài tập"
              ctaHref="/homework"
            />
            <ActionCard 
              title="Học viên vắng nhiều"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Học viên cần quan tâm đặc biệt."
              ctaText="Xem Học viên"
              ctaHref="/students"
            />
            <ActionCard 
              title="Báo cáo cần duyệt"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Báo cáo gửi phụ huynh."
              ctaText="Về Danh mục công việc"
              ctaHref="/workspaces"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
