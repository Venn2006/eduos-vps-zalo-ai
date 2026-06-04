import React from 'react';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { AI_ADDON_CATALOG, AIAddonCategory } from '@eduos/shared/src/lib/aiAddonCatalog';
import { Bot, CheckCircle2, AlertTriangle, ShieldCheck, Settings, Sparkles, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Kho AI Tự Động Hóa - EduOS',
};

const CATEGORY_LABELS: Record<AIAddonCategory, string> = {
  STUDENT_CARE: "Chăm sóc Học viên",
  ACADEMIC: "Học thuật & Đào tạo",
  SALES: "Tuyển sinh & Bán hàng",
  MARKETING: "Marketing",
  MANAGEMENT: "Quản trị Điều hành"
};

const MODE_LABELS: Record<string, string> = {
  AUTO: "Tự động (Rủi ro thấp)",
  AUTO_FOR_LOW_RISK: "Tự động (Rủi ro thấp)",
  AUTO_WITH_DASHBOARD_REPORT: "Tự động & Báo cáo",
  AUTO_SANDBOX: "Tự động (Sandbox)",
  REVIEW_REQUIRED: "Duyệt tay hoặc Staff Handoff",
  REVIEW_REQUIRED_FOR_HIGH_RISK: "Staff Handoff (Chuyển nhân viên)",
  TEACHER_APPROVAL_REQUIRED: "Giáo viên duyệt",
  DRAFT_ONLY: "Chỉ tạo nháp",
  SCHEDULE_WITH_APPROVAL: "Lên lịch (Cần duyệt)",
  READ_ONLY_INSIGHTS: "Chỉ đọc dữ liệu",
  ACTION_DRAFTS_WITH_APPROVAL: "Đề xuất hành động",
  OFF: "Tắt"
};

export default async function AIAddonsPage() {
  const authSession = await getSession();

  // Strict RBAC check - Only Owner/Admin can purchase or configure add-ons
  if (!canAccessRoute(authSession?.role, "/ai-addons") || (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const groupedAddons = AI_ADDON_CATALOG.reduce((acc, addon) => {
    if (!acc[addon.category]) acc[addon.category] = [];
    acc[addon.category].push(addon);
    return acc;
  }, {} as Record<string, typeof AI_ADDON_CATALOG>);

  const formatVND = (price?: number) => {
    if (!price) return "Tùy chỉnh";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
              Module Mở Rộng
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3 flex items-center gap-3">
            <Bot className="w-8 h-8 opacity-90" />
            Kho Tính Năng AI Mở Rộng
          </h1>
          <p className="text-indigo-100 max-w-2xl text-lg leading-relaxed">
            Nâng cấp trung tâm bằng các trợ lý AI chuyên biệt. Bạn toàn quyền quyết định cơ chế hoạt động: 
            <strong className="text-white"> Tự động xử lý</strong>, <strong className="text-white">Chuyển giao nhân viên (Staff Handoff)</strong>, hoặc <strong className="text-white">Trình duyệt (Approval)</strong> để đảm bảo an toàn tối đa.
          </p>
        </div>
      </div>

      {/* CATALOG */}
      <div className="space-y-16">
        {Object.entries(groupedAddons).map(([category, addons]) => (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">
              {CATEGORY_LABELS[category as AIAddonCategory] || category}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {addons.map((addon) => (
                <div key={addon.id} className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {addon.demoStatus === 'PILOT_READY' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">Đã sẵn sàng</span>}
                        {addon.demoStatus === 'SANDBOX_ONLY' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700">Sandbox / Demo</span>}
                        {addon.demoStatus === 'COMING_SOON' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">Sắp có</span>}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{addon.name}</h3>
                    <p className="text-slate-600 text-sm h-10 line-clamp-2">{addon.shortDescription}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Phí gia hạn</p>
                        <p className="text-xl font-black text-indigo-700">
                          {addon.isPremium ? "Gói Premium" : `${formatVND(addon.priceVndMonthly)}/tháng`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-500 mb-1">Kênh giao tiếp</p>
                        <p className="text-sm font-bold text-slate-700">{addon.channels.length} Kênh</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 flex-1">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Cơ chế an toàn mặc định</p>
                          <p className="text-sm text-slate-600 mt-0.5">{MODE_LABELS[addon.defaultMode] || addon.defaultMode}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Bắt buộc phải duyệt tay khi:</p>
                          <ul className="mt-1 space-y-1">
                            {addon.requiresApprovalFor.map((req, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 flex items-center gap-3">
                      <Link href={`/ai-addons/${addon.id}`} className="flex-1">
                        <button className="w-full py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2">
                          Xem chi tiết
                        </button>
                      </Link>
                      
                      {addon.demoStatus === 'COMING_SOON' ? (
                        <button disabled className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm flex justify-center items-center gap-2 cursor-not-allowed">
                          <Lock className="w-4 h-4" />
                          Sắp có
                        </button>
                      ) : (
                        <Link href={`/settings`} className="flex-1">
                          <button className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2 shadow-sm hover:shadow">
                            {addon.ctaLabel}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
