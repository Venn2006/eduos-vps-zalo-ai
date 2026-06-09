"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

import { PageShell } from '@/components/layout/PageShell';

type Plan = {
  name: string;
  description: string;
  monthly: string;
  annual: string;
  cta: string;
  href: string;
  highlight?: boolean;
  includedTitle: string;
  features: string[];
  mutedFeatures?: string[];
};

const plans: Plan[] = [
  {
    name: 'Cơ Bản',
    description: 'Quản lý vận hành trung tâm, khách, lớp học và điểm danh cơ bản.',
    monthly: '300k',
    annual: '240k',
    cta: 'Kích hoạt dùng thử trước',
    href: '/billing?plan=basic',
    includedTitle: 'Bao gồm:',
    features: [
      'Tối đa 150 học viên',
      'Quản lý tuyển sinh và chăm sóc khách',
      'Quản lý lớp học, học viên và điểm danh',
      'Báo cáo vận hành cơ bản',
    ],
    mutedFeatures: ['Chưa bật AI tự động', 'Chưa bật kết nối Zalo thật'],
  },
  {
    name: 'Chuyên Nghiệp',
    description: 'Dùng thử dùng thật cho CRM, Zalo cần duyệt, AI gợi ý và quy trình duyệt an toàn.',
    monthly: '750k',
    annual: '600k',
    cta: 'Trả dùng thử 1 triệu để dùng thật',
    href: '/billing?plan=pro-dùng thử',
    highlight: true,
    includedTitle: 'Bao gồm gói Cơ Bản, cộng thêm:',
    features: [
      'Tối đa 350 học viên',
      'Hàng chờ duyệt cho tin nhắn',
      'AI gợi ý câu trả lời và kịch bản chăm sóc',
      'Trung tâm an toàn và checklist sẵn sàng gửi thật',
      'Hỗ trợ cấu hình dùng thử trước khi mở gửi thật',
    ],
  },
  {
    name: 'Doanh Nghiệp',
    description: 'Thiết kế luồng riêng, nhiều cơ sở, nhiều kênh và hỗ trợ triển khai sát vận hành.',
    monthly: '1.2tr',
    annual: '960k',
    cta: 'Gửi xác nhận thanh toán',
    href: '/billing?plan=enterprise',
    includedTitle: 'Bao gồm gói Pro, cộng thêm:',
    features: [
      'Không giới hạn theo gói nhỏ, chốt theo nhu cầu thật',
      'Thiết kế quy trình AI theo vận hành trung tâm',
      'Bảng điều hành CEO và báo cáo nâng cao',
      'Hỗ trợ kỹ thuật ưu tiên trong giai đoạn triển khai',
    ],
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <PageShell
      title="Gói dịch vụ & dùng thử"
      description="Chọn gói phù hợp để dùng thật có kiểm soát. Dùng thử 1 triệu giúp khách trải nghiệm trước khi cam kết gói lớn."
    >
      <div className="mx-auto max-w-6xl space-y-8 p-6 pb-12">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm kháching-6 text-amber-900">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <ShieldCheck className="h-4 w-4" /> Chính sách dùng thử an toàn
          </div>
          <p>
            Thanh toán dùng thử là để dùng hệ thống thật với dữ liệu thật. Các luồng gửi tin ra Zalo/Facebook vẫn đi qua hàng chờ duyệt và checklist sẵn sàng trước khi mở gửi thật.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-md px-5 py-2 text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-bold transition-all ${isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Theo năm <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Giảm 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-lg border p-6 shadow-sm ${plan.highlight ? 'border-indigo-300 bg-indigo-600 text-white shadow-indigo-500/20' : 'border-slate-200 bg-white text-slate-900'}`}
            >
              {plan.highlight && (
                <div className="absolute right-6 top-0 flex -translate-y-1/2 items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase text-slate-900 shadow">
                  <Sparkles className="h-3 w-3" /> Dùng thử đề xuất
                </div>
              )}

              <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
              <p className={`mb-6 min-h-16 text-sm kháching-6 ${plan.highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-black">{isAnnual ? plan.annual : plan.monthly}</span>
                <span className={plan.highlight ? 'text-indigo-100' : 'text-slate-500'}>/tháng</span>
              </div>
              <Link
                href={plan.href}
                className={`mb-6 block w-full rounded-lg px-4 py-3 text-center font-bold transition-colors ${plan.highlight ? 'bg-white text-indigo-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                {plan.cta}
              </Link>

              <div className="flex-1 space-y-4">
                <p className={`text-sm font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.includedTitle}</p>
                <ul className={`space-y-3 text-sm ${plan.highlight ? 'text-indigo-50' : 'text-slate-600'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-emerald-500'}`} /> {feature}
                    </li>
                  ))}
                  {plan.mutedFeatures?.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-400">
                      <HelpCircle className="h-5 w-5 shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
