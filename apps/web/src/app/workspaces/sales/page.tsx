import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { ActionCard } from '@/components/ui/ActionCard';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { Sparkles } from 'lucide-react';
import { startOfDay, endOfDay } from "date-fns";
import Link from 'next/link';

// Reusable AI Prompt pill
function AiPrompt({ text }: { text: string }) {
  return (
    <Link href={`/ai-center?prompt=${encodeURIComponent(text)}`} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 transition-colors text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 cursor-pointer">
      <Sparkles className="w-3 h-3" />
      "{text}"
    </Link>
  );
}

export default async function SalesWorkspaceDashboard() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/workspaces/sales")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);
  const yesterday24hAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // --- 1. Fetch KPI metrics ---
  const [
    newLeadsToday,
    hotLeads,
    untouchedLeads,
    trialsToday,
    attendedButNotWonTrials,
    wonLeadsToday,
    hotUntouchedLeads,
    over24hUntouchedLeads,
    trialsTodayAction, // Same as trialsToday but for the Action section conceptually
  ] = await Promise.all([
    // Lead mới hôm nay
    prisma.lead.count({ where: { tenantId, createdAt: { gte: start, lte: end } } }),
    // Lead nóng
    prisma.lead.count({ where: { tenantId, temperature: "HOT" } }),
    // Lead chưa gọi
    prisma.lead.count({ where: { tenantId, callCount: 0 } }),
    // Lịch học thử hôm nay
    prisma.trialBooking.count({ where: { tenantId, trialDate: { gte: start, lte: end } } }),
    // Học thử xong cần gọi chốt (ATTENDED but Lead stage not WON/LOST)
    prisma.trialBooking.count({ 
      where: { 
        tenantId, 
        status: "ATTENDED", 
        lead: { stage: { notIn: ["WON", "LOST"] } } 
      } 
    }),
    // Đã chốt (WON) hôm nay
    prisma.lead.count({ where: { tenantId, stage: "WON", updatedAt: { gte: start, lte: end } } }),
    
    // Action: Lead nóng chưa chăm sóc
    prisma.lead.count({ where: { tenantId, temperature: "HOT", callCount: 0 } }),
    // Action: Lead chưa gọi quá 24h
    prisma.lead.count({ where: { tenantId, callCount: 0, createdAt: { lte: yesterday24hAgo } } }),
    // Action: Học thử hôm nay (same as above conceptually, just retrieving again or reusing)
    prisma.trialBooking.count({ where: { tenantId, trialDate: { gte: start, lte: end } } })
  ]);

  return (
    <div className="space-y-8 pb-12">
      {!tenant && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <h3 className="text-red-800 font-bold">Lỗi Phiên Đăng Nhập</h3>
          <p className="text-red-700 text-sm mt-1">Không tìm thấy trung tâm.</p>
        </div>
      )}

      {/* TOP SECTION */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-xl p-6 text-white shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Tổng quan tuyển sinh hôm nay</h2>
          <p className="text-slate-300">Tập trung vào lead nóng, học thử, và việc cần gọi ngay.</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">AI Gợi Ý Tương Tác</h3>
          <div className="flex gap-2 flex-wrap">
            <AiPrompt text="Hôm nay cần gọi lead nào trước?" />
            <AiPrompt text="Lead nào đang nóng nhưng chưa được chăm sóc?" />
            <AiPrompt text="Học thử nào cần gọi chốt hôm nay?" />
            <AiPrompt text="Tư vấn nào đang bị tồn lead?" />
            <AiPrompt text="Tin nhắn Fanpage nào cần phản hồi ngay?" />
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6">
          <Link href="/workspaces/sales/calling" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Gọi data hôm nay / Xem KPI
          </Link>
        </div>
      </section>

      <div className="space-y-10">
        
        {/* KPI SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">📊 Chỉ số phễu tuyển sinh</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            <ActionCard 
              title="Lead mới hôm nay"
              metric={newLeadsToday}
              severity="info"
              reason="Khách hàng tiềm năng mới đăng ký."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Lead nóng"
              metric={hotLeads}
              severity={hotLeads > 0 ? "warning" : "info"}
              reason="Khách hàng quan tâm cao."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Lead chưa gọi"
              metric={untouchedLeads}
              severity={untouchedLeads > 0 ? "warning" : "success"}
              reason="Khách hàng chờ được tư vấn lần đầu."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Lịch học thử hôm nay"
              metric={trialsToday}
              severity={trialsToday > 0 ? "success" : "info"}
              reason="Buổi học thử sắp diễn ra."
              ctaText="Xem Học thử"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Học thử cần follow-up"
              metric={attendedButNotWonTrials}
              severity={attendedButNotWonTrials > 0 ? "warning" : "success"}
              reason="Đã học thử nhưng chưa chốt."
              ctaText="Xem Học thử"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Đã chốt (WON)"
              metric={wonLeadsToday}
              severity={wonLeadsToday > 0 ? "success" : "info"}
              reason="Số khách hàng đã chốt hôm nay."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Tỷ lệ chuyển đổi"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Cần thêm thời gian thu thập đủ mẫu."
              ctaText="Xem Báo cáo"
              ctaHref="/workspaces"
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
              title="Lead nóng chưa chăm sóc"
              metric={hotUntouchedLeads}
              severity={hotUntouchedLeads > 0 ? "critical" : "success"}
              reason="Ưu tiên gọi gấp tránh rớt khách."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Lead chưa gọi quá 24h"
              metric={over24hUntouchedLeads}
              severity={over24hUntouchedLeads > 0 ? "critical" : "success"}
              reason="Lead đang bị tồn đọng quá lâu."
              ctaText="Xem Leads"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Học thử hôm nay"
              metric={trialsTodayAction}
              severity={trialsTodayAction > 0 ? "warning" : "success"}
              reason="Nhắc lịch học thử tránh quên."
              ctaText="Xem Học thử"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Học thử xong cần chốt"
              metric={attendedButNotWonTrials}
              severity={attendedButNotWonTrials > 0 ? "critical" : "success"}
              reason="Gọi phụ huynh hỏi thăm sau buổi học."
              ctaText="Xem Học thử"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Tin Fanpage chờ trả lời"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Sẽ cập nhật tích hợp với Fanpage."
              ctaText="Mở Fanpage Inbox"
              ctaHref="/fanpage-inbox"
            />
          </div>
        </section>

        {/* CONSULTANT PERFORMANCE SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">👩‍💼 Hiệu suất theo Tư vấn viên</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="bg-slate-100 text-slate-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa đủ dữ liệu theo từng tư vấn</h3>
              <p className="text-slate-500 max-w-md">
                Hệ thống đang thu thập thêm dữ liệu để hiển thị chính xác KPI cá nhân. Vui lòng quay lại sau.
              </p>
              <div className="mt-6">
                <a href="/workspaces" className="text-primary font-medium hover:underline text-sm">Về Danh mục công việc &rarr;</a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
