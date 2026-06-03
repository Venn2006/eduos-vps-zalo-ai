import React from 'react';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { prisma } from '@eduos/db';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Clock, Users, BookOpen, GraduationCap, CreditCard, Receipt, PiggyBank } from 'lucide-react';
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

export default async function FinanceWorkspacePage() {
  const authSession = await getSession();

  // strict RBAC check
  if (!canAccessRoute(authSession?.role, "/workspaces/finance")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  // Date boundaries for "Today" and "This month"
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Queries using Tenant-scope
  const [
    unpaidInvoices,
    overdueInvoices,
    renewalCandidates,
    pendingReminders,
    todayRevenueResult,
    monthRevenueResult,
    debtCurrentResult,
    debt1to7Result,
    debt8to14Result,
    debt15PlusResult
  ] = await Promise.all([
    // Hóa đơn chưa thanh toán (UNPAID hoặc PARTIALLY_PAID)
    prisma.invoice.count({
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] }
      }
    }),
    // Công nợ quá hạn
    prisma.invoice.count({
      where: {
        tenantId,
        status: "OVERDUE"
      }
    }),
    // Sắp tái phí
    prisma.renewalCandidate.count({
      where: {
        tenantId,
        status: "NEW"
      }
    }),
    // Tin nhắc phí chờ duyệt
    prisma.debtReminder.count({
      where: {
        tenantId,
        status: "PENDING_APPROVAL"
      }
    }),
    // Doanh thu hôm nay
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        paidAt: { gte: startOfDay, lte: endOfDay }
      }
    }),
    // Đã thu tháng này
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        paidAt: { gte: startOfMonth, lte: endOfDay }
      }
    }),
    // Công nợ hiện tại (chưa quá hạn)
    prisma.invoice.aggregate({
      _count: { id: true },
      _sum: { remainingAmount: true },
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { gte: startOfDay }
      }
    }),
    // Công nợ quá hạn 1-7 ngày
    prisma.invoice.aggregate({
      _count: { id: true },
      _sum: { remainingAmount: true },
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { lt: startOfDay, gte: new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
    // Công nợ quá hạn 8-14 ngày
    prisma.invoice.aggregate({
      _count: { id: true },
      _sum: { remainingAmount: true },
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { 
          lt: new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000),
          gte: new Date(startOfDay.getTime() - 14 * 24 * 60 * 60 * 1000) 
        }
      }
    }),
    // Công nợ quá hạn 15+ ngày
    prisma.invoice.aggregate({
      _count: { id: true },
      _sum: { remainingAmount: true },
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { lt: new Date(startOfDay.getTime() - 14 * 24 * 60 * 60 * 1000) }
      }
    })
  ]);

  const todayRevenue = todayRevenueResult._sum.amount || 0;
  const monthRevenue = monthRevenueResult._sum.amount || 0;

  // Format currency helper
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <PiggyBank className="w-8 h-8 opacity-80" />
            Tổng quan tài chính hôm nay
          </h1>
          <p className="text-emerald-100 max-w-2xl text-lg mb-6 leading-relaxed">
            Tập trung vào học phí, công nợ, tái phí và nhắc phí cần duyệt.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            <AiPrompt text="Ai chưa đóng tiền?" />
            <AiPrompt text="Học viên nào sắp tái phí?" />
            <AiPrompt text="Công nợ nào quá hạn?" />
            <AiPrompt text="Tin nhắc phí nào cần duyệt?" />
            <AiPrompt text="Doanh thu tháng này thế nào?" />
          </div>
        </div>
      </div>

      <div className="px-2 space-y-12">
        {/* KPI SECTION */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">📊 Chỉ số Tài chính</h2>
            
            {/* Visual Filters (UI Placeholder) */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-4 py-1.5 text-sm font-bold bg-white text-indigo-700 shadow-sm rounded-md border border-slate-200">
                Hôm nay
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors" disabled>
                Tháng này
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors" disabled>
                Quý này
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors" disabled>
                Năm nay
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <ActionCard 
              title="Doanh thu hôm nay"
              metric={formatVND(todayRevenue)}
              severity="success"
              reason="Tổng số tiền thu được trong ngày."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Đã thu tháng này"
              metric={formatVND(monthRevenue)}
              severity="info"
              reason="Tổng doanh thu cộng dồn trong tháng."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Hóa đơn chưa thanh toán"
              metric={unpaidInvoices}
              severity={unpaidInvoices > 0 ? "warning" : "success"}
              reason="Số lượng hóa đơn chưa được thanh toán hoàn tất."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Công nợ quá hạn"
              metric={overdueInvoices}
              severity={overdueInvoices > 0 ? "critical" : "success"}
              reason="Số lượng hóa đơn đã quá hạn thanh toán."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Sắp tái phí"
              metric={renewalCandidates}
              severity={renewalCandidates > 0 ? "info" : "success"}
              reason="Học viên sắp hết khóa, cần tư vấn gia hạn."
              ctaText="Xem Tái phí"
              ctaHref="/renewals"
            />
            <ActionCard 
              title="Tin nhắc phí chờ duyệt"
              metric={pendingReminders}
              severity={pendingReminders > 0 ? "warning" : "success"}
              reason="Các tin nhắn nhắc phí do AI soạn cần bạn duyệt trước khi gửi."
              ctaText="Hỏi AI về tài chính"
              ctaHref="/ai-center"
            />
            <ActionCard 
              title="Học viên cần tư vấn tái phí"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Chờ thêm dữ liệu để phân loại học viên."
              ctaText="Xem Tái phí"
              ctaHref="/renewals"
            />
            <ActionCard 
              title="Tổng chi phí"
              metric="Sắp có"
              severity="info"
              reason="Đang phát triển tính năng phiếu chi và bảng lương."
              ctaText="Sắp ra mắt"
              ctaHref="#"
            />
            <ActionCard 
              title="Lợi nhuận tạm tính"
              metric="Sắp có"
              severity="info"
              reason="Đang chờ hoàn thiện dữ liệu Tổng chi phí."
              ctaText="Sắp ra mắt"
              ctaHref="#"
            />
            <ActionCard 
              title="Doanh thu theo nhân viên"
              metric="Sắp có"
              severity="info"
              reason="Phân bổ doanh thu theo nguồn lead và chốt sale."
              ctaText="Sắp ra mắt"
              ctaHref="#"
            />
            <ActionCard 
              title="Hoa hồng sale tạm tính"
              metric="Sắp có"
              severity="info"
              reason="Dựa trên chính sách hoa hồng từng tháng."
              ctaText="Sắp ra mắt"
              ctaHref="#"
            />
          </div>
        </section>

        {/* DEBT AGING SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4 mt-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">⏳ Công nợ theo tuổi nợ (Debt Aging)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Hiện tại (Chưa tới hạn)"
              metric={formatVND(debtCurrentResult._sum.remainingAmount || 0)}
              severity="info"
              reason={`${debtCurrentResult._count.id} hóa đơn.`}
              ctaText="Xem chi tiết"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Quá hạn 1-7 ngày"
              metric={formatVND(debt1to7Result._sum.remainingAmount || 0)}
              severity="warning"
              reason={`${debt1to7Result._count.id} hóa đơn cần nhắc nhẹ.`}
              ctaText="Xem chi tiết"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Quá hạn 8-14 ngày"
              metric={formatVND(debt8to14Result._sum.remainingAmount || 0)}
              severity="critical"
              reason={`${debt8to14Result._count.id} hóa đơn rủi ro.`}
              ctaText="Xem chi tiết"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Quá hạn 15+ ngày"
              metric={formatVND(debt15PlusResult._sum.remainingAmount || 0)}
              severity="critical"
              reason={`${debt15PlusResult._count.id} hóa đơn nợ xấu.`}
              ctaText="Xem chi tiết"
              ctaHref="/payments"
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
              title="Học viên quá hạn thanh toán"
              metric={overdueInvoices}
              severity={overdueInvoices > 0 ? "critical" : "success"}
              reason="Cần liên hệ phụ huynh để thu hồi công nợ."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Học viên sắp tái phí"
              metric={renewalCandidates}
              severity={renewalCandidates > 0 ? "info" : "success"}
              reason="Danh sách học viên cần tư vấn gói học mới."
              ctaText="Xem Tái phí"
              ctaHref="/renewals"
            />
            <ActionCard 
              title="Tin nhắc phí chờ duyệt"
              metric={pendingReminders}
              severity={pendingReminders > 0 ? "warning" : "success"}
              reason="Xác nhận gửi nhắc nhở thanh toán."
              ctaText="Hỏi AI về tài chính"
              ctaHref="/ai-center"
            />
            <ActionCard 
              title="Hóa đơn cần kiểm tra"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Chưa phát hiện giao dịch bất thường."
              ctaText="Xem Học phí"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Hỏi AI về tài chính"
              metric="Sẵn sàng"
              severity="info"
              reason="AI hỗ trợ giải đáp các số liệu."
              ctaText="Hỏi AI về tài chính"
              ctaHref="/ai-center"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
