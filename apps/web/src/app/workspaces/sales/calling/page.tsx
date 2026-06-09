import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma, CallOutcome, LeadStage } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { PhoneCall, Calendar, Clock, Phone, ArrowLeft, UserCircle, Tag, MessageSquare, History } from 'lucide-react';
import { startOfDay, endOfDay, format } from "date-fns";
import Link from 'next/link';
import { CallOutcomeForm } from './CallOutcomeForm';
import { getSuggestionForOutcome } from '@eduos/shared/src/lib/salesCallingSuggestions';
import { GuardrailPreviewCard } from '@/components/conversation/GuardrailPreviewCard';
import { checkMessageQuality } from '@eduos/shared/src/lib/messageQualityGuardrails';
import { ParentStudentTimeline } from '@/components/timeline/ParentStudentTimeline';
import { buildTimelineEvent, SafeTimelineEvent } from '@eduos/shared/src/lib/timelineBuilder';

const CLOSED_LEAD_STAGES: LeadStage[] = ["REGISTERED", "NO_NEED", "NOT_POTENTIAL"];
const DEFAULT_NEXT_CALL_SUGGESTION = "Hãy nhắc lại ưu đãi hoặc giải quyết thắc mắc từ lần gọi trước để chốt lịch học thử.";
const NEW_LEAD_CALL_SUGGESTION = "Lead mới. Hãy chào mừng và hỏi thăm nhu cầu học tập của bé để tư vấn khóa học phù hợp.";

type ConsultantPerformance = {
  userId: string;
  email: string;
  callsToday: number;
  bookedToday: number;
  followUpsToday: number;
};

type TimelineUserRole = "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";

export default async function SalesCallingPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/workspaces/sales/calling")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const userId = authSession?.userId;
  const isOwnerOrAdmin = authSession?.role === 'OWNER' || authSession?.role === 'ADMIN';

  // Defensive check: If user is SALE but somehow lacks a userId, deny access to prevent tenant-wide leakage
  if (!isOwnerOrAdmin && !userId) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 m-6">
        <h3 className="text-red-800 font-bold mb-2">Lỗi Xác Thực Tài Khoản</h3>
        <p className="text-red-700 text-sm">Không xác định được tài khoản tư vấn. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.</p>
      </div>
    );
  }

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  // --- KPI Metrics ---
  const callsTodayQuery = {
    where: {
      tenantId,
      calledAt: { gte: start, lte: end },
      ...(isOwnerOrAdmin ? {} : { saleId: userId })
    }
  };

  const bookedTrialCallsQuery = {
    where: {
      tenantId,
      calledAt: { gte: start, lte: end },
      outcome: 'BOOKED_TRIAL' as const,
      ...(isOwnerOrAdmin ? {} : { saleId: userId })
    }
  };

  const trialsTodayQuery = {
    where: {
      tenantId,
      trialDate: { gte: start, lte: end }, // Trials scheduled for today
      ...(isOwnerOrAdmin ? {} : { assignedSaleId: userId })
    }
  };

  const followUpsTodayQuery = {
    where: {
      tenantId,
      createdAt: { gte: start, lte: end },
      ...(isOwnerOrAdmin ? {} : { assignedTo: userId })
    }
  };

  const untouchedLeadsQuery = {
    where: {
      tenantId,
      callCount: 0,
      stage: { notIn: CLOSED_LEAD_STAGES },
      ...(isOwnerOrAdmin ? {} : { assignedToId: userId })
    }
  };

  const hotLeadsQuery = {
    where: {
      tenantId,
      temperature: "HOT" as const,
      ...(isOwnerOrAdmin ? {} : { assignedToId: userId })
    }
  };

  const [
    callsToday,
    bookedTrialCallsToday,
    trialsToday,
    followUpsToday,
    untouchedLeads,
    hotLeads
  ] = await Promise.all([
    prisma.callAttempt.count(callsTodayQuery),
    prisma.callAttempt.count(bookedTrialCallsQuery),
    prisma.trialBooking.count(trialsTodayQuery),
    prisma.followUpTask.count(followUpsTodayQuery),
    prisma.lead.count(untouchedLeadsQuery),
    prisma.lead.count(hotLeadsQuery)
  ]);

  const dailyCallTarget = 100;
  const callsRemaining = Math.max(dailyCallTarget - callsToday, 0);
  const conversionRate = callsToday > 0 ? ((bookedTrialCallsToday / callsToday) * 100).toFixed(1) + '%' : 'Chưa đủ dữ liệu';

  // --- Caller Performance ---
  let consultantPerformances: ConsultantPerformance[] = [];
  if (isOwnerOrAdmin) {
    const salesMembers = await prisma.tenantMember.findMany({
      where: { tenantId, role: 'SALE', status: 'ACTIVE' },
      include: { user: { select: { email: true } } }
    });

    if (salesMembers.length > 0) {
      const saleIds = salesMembers.map(m => m.userId);
      const [callsBySale, bookedBySale, followUpsBySale] = await Promise.all([
        prisma.callAttempt.groupBy({
          by: ['saleId'],
          where: { tenantId, calledAt: { gte: start, lte: end }, saleId: { in: saleIds } },
          _count: true
        }),
        prisma.callAttempt.groupBy({
          by: ['saleId'],
          where: { tenantId, calledAt: { gte: start, lte: end }, outcome: 'BOOKED_TRIAL', saleId: { in: saleIds } },
          _count: true
        }),
        prisma.followUpTask.groupBy({
          by: ['assignedTo'],
          where: { tenantId, createdAt: { gte: start, lte: end }, assignedTo: { in: saleIds } },
          _count: true
        })
      ]);

      consultantPerformances = salesMembers.map(m => {
        const cCount = callsBySale.find(c => c.saleId === m.userId)?._count ?? 0;
        const bCount = bookedBySale.find(b => b.saleId === m.userId)?._count ?? 0;
        const fCount = followUpsBySale.find(f => f.assignedTo === m.userId)?._count ?? 0;
        return {
          userId: m.userId,
          email: m.user.email,
          callsToday: cCount,
          bookedToday: bCount,
          followUpsToday: fCount
        };
      });
    }
  }

  // --- Queue Fetching ---
  const leadQueue = await prisma.lead.findMany({
    where: {
      tenantId,
      ...(isOwnerOrAdmin ? {} : { assignedToId: userId }),
      stage: { notIn: CLOSED_LEAD_STAGES }
    },
    orderBy: [
      { nextFollowUpAt: 'asc' }, // Overdue first
      { temperature: 'desc' } // HOT first
    ],
    take: 10,
    include: {
      source: true,
      course: true,
      callAttempts: {
        orderBy: { calledAt: 'desc' },
        take: 1
      }
    }
  });

  const activeLead = leadQueue.length > 0 ? leadQueue[0] : null;

  const activeLeadOutboxItems = activeLead ? await prisma.sandboxOutboxItem.findMany({
    where: {
      tenantId,
      OR: [
        { sourceId: activeLead.id },
        { recipientId: activeLead.id },
        ...(activeLead.phone ? [{ recipientId: activeLead.phone }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  }) : [];

  const activeLeadTags = activeLead ? [
    `Giai đoạn: ${activeLead.stage}`,
    `Độ nóng: ${activeLead.temperature}`,
    activeLead.source?.name ? `Nguồn: ${activeLead.source.name}` : null,
    activeLead.course?.name ? `Khóa: ${activeLead.course.name}` : null,
    activeLead.lastCallOutcome ? `Kết quả gần nhất: ${activeLead.lastCallOutcome}` : null,
    activeLead.nextFollowUpAt ? `Hẹn lại: ${format(activeLead.nextFollowUpAt, 'dd/MM HH:mm')}` : null,
  ].filter((tag): tag is string => Boolean(tag)) : [];

  const nextCallSuggestion = activeLead
    ? activeLead.callCount === 0
      ? NEW_LEAD_CALL_SUGGESTION
      : getSuggestionForOutcome(activeLead.lastCallOutcome as CallOutcome | null)?.copy || DEFAULT_NEXT_CALL_SUGGESTION
    : DEFAULT_NEXT_CALL_SUGGESTION;
  const timelineUserRole = (authSession?.role ?? 'UNKNOWN') as TimelineUserRole;

  // --- Derive Timeline for Preview ---
  const timelineEvents: SafeTimelineEvent[] = [];
  if (activeLead) {
    timelineEvents.push(buildTimelineEvent({
      id: `lead_created_${activeLead.id}`,
      occurredAt: activeLead.createdAt,
      type: 'LEAD_CREATED',
      title: 'Tạo Lead mới',
      rawSummary: `Lead ${activeLead.name} được tạo trên hệ thống từ nguồn ${activeLead.source?.name || 'không xác định'}. SĐT: ${activeLead.phone || 'trống'}.`,
      actorLabel: 'Hệ thống',
      actorType: 'SYSTEM',
      source: 'EduOS Core',
    }));

    if (activeLead.callAttempts && activeLead.callAttempts.length > 0) {
      const lastCall = activeLead.callAttempts[0];
      timelineEvents.push(buildTimelineEvent({
        id: `call_${lastCall.id}`,
        occurredAt: lastCall.calledAt,
        type: 'CALL_LOGGED',
        title: 'Cuộc gọi Sale',
        rawSummary: `Sale ghi nhận kết quả: ${lastCall.outcome}. Ghi chú: ${lastCall.notes || 'Không có ghi chú.'}`,
        actorLabel: 'Tư vấn viên',
        actorType: 'STAFF',
        source: 'Sales Calling',
        tags: [lastCall.outcome],
      }));
    }

    activeLeadOutboxItems.forEach((item) => {
      timelineEvents.push(buildTimelineEvent({
        id: `sandbox_outbox_${item.id}`,
        occurredAt: item.createdAt,
        type: 'AI_DRAFT_CREATED',
        title: 'Nháp gửi duyệt trước',
        rawSummary: `${item.messageSafeSummary} Trạng thái: ${item.status}.`,
        actorLabel: item.createdByUserId ? 'Nhân viên' : 'Hệ thống',
        actorType: item.createdByUserId ? 'STAFF' : 'SYSTEM',
        source: `${item.channel} Hàng chờ duyệt`,
        tags: [item.status, item.readinessStatus].filter(Boolean),
        relatedEntityType: 'SandboxOutboxItem',
        relatedEntityId: item.id,
      }));
    });
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gọi data tuyển sinh hôm nay</h1>
          <p className="text-slate-500 mt-1">Tập trung gọi đúng người, ghi nhận kết quả nhanh và không bỏ sót follow-up.</p>
        </div>
        <Link href="/workspaces/sales" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white px-4 py-2 rounded-lg border shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Về Sales Workspace
        </Link>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-blue-500"/> Cuộc gọi hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{callsToday} <span className="text-sm font-normal text-slate-400">/ {dailyCallTarget}</span></span>
          <span className="text-xs text-slate-500 mt-1">Mục tiêu nội bộ: {dailyCallTarget}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500"/> Còn lại hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{callsRemaining}</span>
          <span className="text-xs text-slate-500 mt-1">Cuộc gọi cần đạt</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-500"/> Lịch học thử hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{trialsToday}</span>
          <span className="text-xs text-slate-500 mt-1">Lịch phải đón tiếp</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><UserCircle className="w-4 h-4 text-indigo-500"/> Đặt lịch học thử</span>
          <span className="text-2xl font-bold text-slate-900">{bookedTrialCallsToday}</span>
          <span className="text-xs text-slate-500 mt-1">Tạo từ cuộc gọi: {conversionRate}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Tag className="w-4 h-4 text-red-500"/> Lead nóng</span>
          <span className="text-2xl font-bold text-slate-900">{hotLeads}</span>
          <span className="text-xs text-slate-500 mt-1">Lead chưa gọi: {untouchedLeads}</span>
        </div>
      </div>

      {/* CALLER PERFORMANCE (OWNER/ADMIN ONLY) */}
      {isOwnerOrAdmin && (
        <div className="bg-white border shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-indigo-500" />
            Hiệu suất tư vấn hôm nay
          </h3>
          {consultantPerformances.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {consultantPerformances.map(c => (
                <div key={c.userId} className="border rounded-lg p-4 bg-slate-50">
                  <div className="font-semibold text-slate-900 mb-2 truncate" title={c.email}>{c.email.split('@')[0]}</div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex justify-between"><span>Gọi:</span> <span className="font-medium text-slate-900">{c.callsToday}</span></div>
                    <div className="flex justify-between"><span>Đặt hẹn:</span> <span className="font-medium text-slate-900">{c.bookedToday}</span></div>
                    <div className="flex justify-between"><span>Follow-up:</span> <span className="font-medium text-slate-900">{c.followUpsToday}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-sm">Chưa đủ dữ liệu theo từng tư vấn. (Chưa có nhân viên Sales nào)</div>
          )}
        </div>
      )}

      {!isOwnerOrAdmin && (
        <div className="bg-white border shadow-sm rounded-xl p-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <History className="w-5 h-5 text-indigo-500" />
             <span className="font-bold text-slate-800">Hiệu suất của tôi hôm nay:</span>
             <span className="text-sm text-slate-600 ml-2">Gọi: <strong className="text-slate-900">{callsToday}</strong></span>
             <span className="text-sm text-slate-600 ml-2">Đặt hẹn: <strong className="text-slate-900">{bookedTrialCallsToday}</strong></span>
             <span className="text-sm text-slate-600 ml-2">Follow-up: <strong className="text-slate-900">{followUpsToday}</strong></span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR: QUEUE */}
        <div className="bg-white border shadow-sm rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Danh sách chờ gọi
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{leadQueue.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {leadQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Không có lead nào trong hàng đợi.
              </div>
            ) : (
              leadQueue.map((lead, index) => {
                const isActive = index === 0;
                return (
                  <div key={lead.id} className={`p-3 rounded-lg border text-sm transition-colors ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>{lead.name}</span>
                      {lead.temperature === 'HOT' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">HOT</span>}
                    </div>
                    <div className="text-slate-500 text-xs truncate mb-2">{lead.phone || 'Không có SĐT'}</div>
                    {lead.nextFollowUpAt && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <Calendar className="w-3 h-3" />
                        Hẹn: {format(lead.nextFollowUpAt, "dd/MM HH:mm")}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN STAGE: CALL CARD */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeLead ? (
            <>
              {/* Active Lead Info */}
              <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">{activeLead.name}</h2>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        {activeLead.phone ? (
                          <span className="flex items-center gap-1 text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded-md">
                            <Phone className="w-3.5 h-3.5" /> {activeLead.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có SĐT</span>
                        )}
                        {activeLead.source && <span>Nguồn: {activeLead.source.name}</span>}
                        {activeLead.course && <span>Khóa học: {activeLead.course.name}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded border uppercase">{activeLead.stage}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded border uppercase ${
                        activeLead.temperature === 'HOT' ? 'bg-red-50 border-red-200 text-red-600' :
                        activeLead.temperature === 'WARM' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                        'bg-blue-50 border-blue-200 text-blue-600'
                      }`}>
                        {activeLead.temperature}
                      </span>
                    </div>
                  </div>

                  {activeLead.phone && (
                    <a href={`tel:${activeLead.phone}`} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm">
                      <PhoneCall className="w-5 h-5" />
                      Gọi ngay
                    </a>
                  )}
                </div>

                <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><History className="w-4 h-4"/> Lịch sử gọi</h4>
                    <div className="text-sm text-slate-700 space-y-2">
                      <p><span className="text-slate-500">Số lần gọi:</span> {activeLead.callCount}</p>
                      <p><span className="text-slate-500">Lần gọi cuối:</span> {activeLead.lastCallAt ? format(activeLead.lastCallAt, 'dd/MM/yyyy HH:mm') : 'Chưa gọi'}</p>
                      <p><span className="text-slate-500">Kết quả cuối:</span> {activeLead.lastCallOutcome || 'N/A'}</p>
                      {activeLead.callAttempts && activeLead.callAttempts.length > 0 && activeLead.callAttempts[0].notes && (
                        <div className="mt-2 p-3 bg-white border rounded-md italic text-slate-600 shadow-sm">
                          &quot;{activeLead.callAttempts[0].notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4"/> Gợi ý kịch bản cuộc gọi tiếp theo</h4>
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-900 leading-relaxed mb-3">
                        {nextCallSuggestion}
                      </div>
                      <GuardrailPreviewCard result={checkMessageQuality({
                        message: nextCallSuggestion,
                        channel: "INTERNAL",
                        audience: "LEAD",
                        staffRole: "SALE"
                      })} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-primary" /> Nhãn từ dữ liệu lead
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {activeLeadTags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full border border-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t bg-white flex items-center gap-4 text-sm">
                  <Link href="/leads" className="text-blue-600 font-medium hover:underline">Xem chi tiết Lead</Link>
                  <Link href="/trial-bookings" className="text-blue-600 font-medium hover:underline">Xem lịch học thử</Link>
                </div>
              </div>

              {/* ACTION PANEL */}
              <div className="bg-white border shadow-sm rounded-xl p-6">
                <CallOutcomeForm leadId={activeLead.id} />
              </div>

              {/* TIMELINE (PREVIEW) */}
              <ParentStudentTimeline
                events={timelineEvents}
                userRole={timelineUserRole}
                isPreview={true}
              />
            </>
          ) : (
            <div className="bg-white border shadow-sm rounded-xl p-12 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hoàn thành xuất sắc!</h2>
              <p className="text-slate-500 max-w-md mx-auto">Bạn đã xử lý hết tất cả lead trong hàng đợi hôm nay. Hãy nghỉ ngơi hoặc xin thêm data mới nhé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
