"use client";

import React, { useState } from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';
import { AIAddon, AIAddonCategory } from '@eduos/shared/src/lib/aiAddonCatalog';
import { AIAddonCardClient } from './AIAddonCardClient';

type PlanType = 'BASIC' | 'PRO' | 'ENTERPRISE';

const CATEGORY_LABELS: Record<AIAddonCategory, string> = {
  STUDENT_CARE: "Chăm sóc Học viên",
  ACADEMIC: "Học thuật & Đào tạo",
  SALES: "Tuyển sinh & Bán hàng",
  MARKETING: "Marketing",
  MANAGEMENT: "Quản trị Điều hành"
};

export function AiAddonsWrapperClient({ catalog, groupedAddons }: { catalog: AIAddon[], groupedAddons: Record<string, AIAddon[]> }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('BASIC');

  const isFreeInPlan = (addon: AIAddon) => {
    if (selectedPlan === 'ENTERPRISE') return true;
    if (selectedPlan === 'PRO' && addon.includedInPlan === 'PRO') return true;
    return false;
  };

  const paidAddonCost = catalog.reduce((total, addon) => {
    if (addon.isPremium || isFreeInPlan(addon)) return total;
    return total + (addon.priceVndMonthly || 0);
  }, 0);

  const formatVND = (price?: number) => {
    if (!price) return "0đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:flex-row">
        <div>
          <h3 className="font-bold text-slate-800">Xem catalog theo gói</h3>
          <p className="text-sm text-slate-500">Đây là bảng tham khảo tính năng và chi phí. Kích hoạt thật đi qua Billing và đối soát thủ công.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {[
            ['BASIC', 'Cơ bản'],
            ['PRO', 'Gói Pro'],
            ['ENTERPRISE', 'Doanh nghiệp'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedPlan(value as PlanType)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${selectedPlan === value ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Calculator className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Ước tính phí add-on ngoài gói</h3>
            <p className="text-sm text-slate-500">Không tự cài đặt. Không tự trừ tiền. Billing sẽ tạo yêu cầu xác nhận thanh toán.</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="mb-1 text-sm font-medium text-slate-500">Nếu bật toàn bộ add-on có phí</p>
          <p className="text-2xl font-black text-emerald-600">{formatVND(paidAddonCost)}</p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>AI Add-ons hiện là catalog cấu hình an toàn. Các module chỉ hoạt động ở duyệt trước/pilot cho tới khi thanh toán được đối soát và kết nối thật được bật.</p>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedAddons).map(([category, addons]) => (
          <section key={category} className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-bold text-slate-900">
              {CATEGORY_LABELS[category as AIAddonCategory] || category}
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {addons.map((addon) => (
                <AIAddonCardClient
                  key={addon.id}
                  addon={addon}
                  isFreeInPlan={isFreeInPlan(addon)}
                  selectedPlan={selectedPlan}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
