import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { ActionCard } from '@/components/ui/ActionCard';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { PhoneCall, Calendar, Clock, AlertCircle, Phone, ArrowLeft, ArrowRight, UserCircle, Tag, MessageSquare, History } from 'lucide-react';
import { startOfDay, endOfDay, format } from "date-fns";
import { vi } from 'date-fns/locale';
import Link from 'next/link';

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
  
  const trialsTodayQuery = {
    where: {
      tenantId,
      createdAt: { gte: start, lte: end }, // Trials BOOKED today
      ...(isOwnerOrAdmin ? {} : { assignedSaleId: userId })
    }
  };

  const wonTodayQuery = {
    where: {
      tenantId,
      stage: "WON" as const,
      updatedAt: { gte: start, lte: end },
      ...(isOwnerOrAdmin ? {} : { assignedToId: userId })
    }
  };

  const untouchedLeadsQuery = {
    where: {
      tenantId,
      callCount: 0,
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
    trialsToday,
    wonToday,
    untouchedLeads,
    hotLeads
  ] = await Promise.all([
    prisma.callAttempt.count(callsTodayQuery),
    prisma.trialBooking.count(trialsTodayQuery),
    prisma.lead.count(wonTodayQuery),
    prisma.lead.count(untouchedLeadsQuery),
    prisma.lead.count(hotLeadsQuery)
  ]);

  // --- Queue Fetching ---
  const leadQueue = await prisma.lead.findMany({
    where: {
      tenantId,
      ...(isOwnerOrAdmin ? {} : { assignedToId: userId }),
      stage: { notIn: ["WON", "LOST"] }
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-blue-500"/> Cuộc gọi hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{callsToday} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-500"/> Học thử hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{trialsToday}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-500"/> Chốt hôm nay</span>
          <span className="text-2xl font-bold text-slate-900">{wonToday}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><UserCircle className="w-4 h-4 text-indigo-500"/> Lead chưa gọi</span>
          <span className="text-2xl font-bold text-slate-900">{untouchedLeads}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
          <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Tag className="w-4 h-4 text-red-500"/> Lead nóng</span>
          <span className="text-2xl font-bold text-slate-900">{hotLeads}</span>
        </div>
      </div>

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
                
                {/* History & AI Suggestion */}
                <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><History className="w-4 h-4"/> Lịch sử gọi</h4>
                    <div className="text-sm text-slate-700 space-y-2">
                      <p><span className="text-slate-500">Số lần gọi:</span> {activeLead.callCount}</p>
                      <p><span className="text-slate-500">Lần gọi cuối:</span> {activeLead.lastCallAt ? format(activeLead.lastCallAt, 'dd/MM/yyyy HH:mm') : 'Chưa gọi'}</p>
                      <p><span className="text-slate-500">Kết quả cuối:</span> {activeLead.lastCallOutcome || 'N/A'}</p>
                      {activeLead.callAttempts && activeLead.callAttempts.length > 0 && activeLead.callAttempts[0].notes && (
                        <div className="mt-2 p-3 bg-white border rounded-md italic text-slate-600 shadow-sm">
                          "{activeLead.callAttempts[0].notes}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4"/> Gợi ý kịch bản (AI)</h4>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-900 leading-relaxed">
                      {activeLead.callCount === 0 
                        ? "Lead mới. Hãy chào mừng và hỏi thăm nhu cầu học tập của bé để tư vấn khóa học phù hợp." 
                        : "Lead đã gọi. Hãy nhắc lại ưu đãi hoặc giải quyết thắc mắc từ lần gọi trước để chốt lịch học thử."}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t bg-white flex items-center gap-4 text-sm">
                  <Link href="/leads" className="text-blue-600 font-medium hover:underline">Xem chi tiết Lead</Link>
                  <Link href="/trial-bookings" className="text-blue-600 font-medium hover:underline">Xem lịch học thử</Link>
                </div>
              </div>

              {/* ACTION PANEL */}
              <div className="bg-white border shadow-sm rounded-xl p-6 relative">
                <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                  <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Ghi kết quả cuộc gọi sẽ được bật ở Phase 13.3.
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-4">Ghi nhận kết quả</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button disabled className="py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 opacity-50">Không nghe máy</button>
                  <button disabled className="py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 opacity-50">Sai số</button>
                  <button disabled className="py-2.5 px-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 opacity-50">Quan tâm</button>
                  <button disabled className="py-2.5 px-3 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 opacity-50">Hẹn gọi lại</button>
                  <button disabled className="py-2.5 px-3 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700 opacity-50">Đặt học thử</button>
                  <button disabled className="py-2.5 px-3 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 opacity-50">Từ chối</button>
                  <button disabled className="py-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 opacity-50">Đã đóng tiền</button>
                </div>
              </div>
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
