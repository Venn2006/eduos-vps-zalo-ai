"use client";

import Link from 'next/link';
import React from 'react';
import { AlertTriangle, CheckCircle2, Lock, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { AIAddon } from '@eduos/shared/src/lib/aiAddonCatalog';

const MODE_LABELS: Record<string, string> = {
  AUTO: "Tự động (Rủi ro thấp)",
  AUTO_FOR_LOW_RISK: "Tự động (Rủi ro thấp)",
  AUTO_WITH_DASHBOARD_REPORT: "Tự động & Báo cáo",
  AUTO_SANDBOX: "Tự động, cần duyệt",
  REVIEW_REQUIRED: "Duyệt tay hoặc Staff Handoff",
  REVIEW_REQUIRED_FOR_HIGH_RISK: "Staff Handoff",
  TEACHER_APPROVAL_REQUIRED: "Giáo viên duyệt",
  DRAFT_ONLY: "Chỉ tạo nháp",
  SCHEDULE_WITH_APPROVAL: "Lên lịch (Cần duyệt)",
  READ_ONLY_INSIGHTS: "Chỉ đọc dữ liệu",
  ACTION_DRAFTS_WITH_APPROVAL: "Đề xuất hành động",
  OFF: "Tắt"
};

const formatVND = (price?: number) => {
  if (!price) return "Tùy chỉnh";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export function AIAddonCardClient({
  addon,
  isFreeInPlan,
  selectedPlan,
}: {
  addon: AIAddon,
  isFreeInPlan?: boolean,
  selectedPlan?: string,
}) {
  const isComingSoon = addon.demoStatus === 'COMING_SOON';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end gap-2">
            {isFreeInPlan && (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                <CheckCircle2 className="h-3 w-3" /> Trong gói {selectedPlan}
              </span>
            )}
            {addon.demoStatus === 'PILOT_READY' && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Sẵn sàng dùng thử</span>}
            {addon.demoStatus === 'SANDBOX_ONLY' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Cần duyệt trước</span>}
            {isComingSoon && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Roadmap</span>}
          </div>
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">{addon.name}</h3>
        <p className="h-10 text-sm text-slate-600 line-clamp-2">{addon.shortDescription}</p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">Phí thuê bao</p>
            {isFreeInPlan ? (
              <p className="text-xl font-black text-emerald-600">0đ trong gói</p>
            ) : (
              <p className="text-xl font-black text-indigo-700">
                {addon.isPremium ? "Gói Premium" : `${formatVND(addon.priceVndMonthly)}/tháng`}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="mb-1 text-sm font-medium text-slate-500">Kênh tích hợp</p>
            <p className="text-sm font-bold text-slate-700">{addon.channels.length} kênh</p>
          </div>
        </div>

        <div className="mb-6 flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-slate-900">Cơ chế an toàn mặc định</p>
              <p className="mt-0.5 text-sm text-slate-600">{MODE_LABELS[addon.defaultMode] || addon.defaultMode}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-slate-900">Yêu cầu duyệt tay khi:</p>
              <ul className="mt-1 space-y-1">
                {addon.requiresApprovalFor.length > 0 ? addon.requiresApprovalFor.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                    {req}
                  </li>
                )) : <li className="text-sm text-slate-600">Không yêu cầu duyệt tay đối với module này.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-4">
          <Link href="/approval-queue" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <Settings className="h-4 w-4" /> Tin chờ duyệt
          </Link>

          {isComingSoon ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-500">
              <Lock className="h-4 w-4" /> Chưa nhận kích hoạt
            </div>
          ) : (
            <Link href="/billing" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">
              Kích hoạt qua Billing
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
