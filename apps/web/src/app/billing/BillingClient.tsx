"use client";

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, CreditCard, QrCode, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

type BillingClientProps = {
  tenantId: string;
  tenantName: string;
  currentStatus: string;
  selectedPlanLabel: string;
  paymentConfig: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrImageUrl?: string;
    supportContact?: string;
  };
};

const EXPERIENCE_PRICE = '1.000.000đ';
const PLAN_CODE = 'PAID_EXPERIENCE_1M';

export function BillingClient({ tenantId, tenantName, currentStatus, selectedPlanLabel, paymentConfig }: BillingClientProps) {
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasPaymentAccount = Boolean(paymentConfig.bankName && paymentConfig.accountNumber && paymentConfig.accountHolder);

  const transferCode = useMemo(() => {
    const shortTenantId = tenantId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `EDUOS ${shortTenantId || 'TRAI NGHIEM'}`;
  }, [tenantId]);

  const copyTransferCode = async () => {
    await navigator.clipboard.writeText(transferCode);
    toast.success('Đã copy nội dung chuyển khoản');
  };

  const handleRequestPaymentReview = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: PLAN_CODE, transferCode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error || 'Không gửi được yêu cầu xác nhận. Vui lòng thử lại.');
      }

      setIsSubmitted(true);
      toast.success(hasPaymentAccount ? 'Đã gửi yêu cầu xác nhận thanh toán' : 'Đã gửi yêu cầu nhận thông tin thanh toán');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không kết nối được máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus === 'ACTIVE') {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-900">Tài khoản đang hoạt động</h2>
        <p className="mt-2 text-slate-600">{tenantName} đã được kích hoạt gói trả phí.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
          {selectedPlanLabel}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-950">Dùng thật trước, quyết định gói lớn sau</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Gói trải nghiệm giúp trung tâm kiểm tra sản phẩm bằng dữ liệu thật, quy trình thật và nhân sự thật. Các luồng gửi tin ra Zalo/Facebook vẫn đi qua hàng chờ duyệt, không tự gửi khi chưa được bật.
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Số tiền trải nghiệm</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-950">{EXPERIENCE_PRICE}</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">đối soát thủ công</span>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm text-slate-700">
          {[
            'Mở các màn hình vận hành chính: khách hàng, học viên, lớp học, tài chính, báo cáo.',
            'Có hàng chờ duyệt tin nhắn để khách thử quy trình mà không sợ gửi nhầm.',
            'Có checklist an toàn trước khi mở gửi thật qua Zalo/Facebook.',
            'Sau khi dùng ổn mới bàn tiếp gói triển khai lớn 4-8 triệu.',
          ].map((feature) => (
            <li key={feature} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Thanh toán và xác nhận</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Bước này chỉ ghi nhận yêu cầu. Hệ thống không tự kích hoạt nếu chưa được đối soát.
        </p>

        {!showPaymentBox ? (
          <Button onClick={() => setShowPaymentBox(true)} className="mt-6 h-11 w-full bg-indigo-600 font-bold hover:bg-indigo-700">
            <CreditCard className="mr-2 h-5 w-5" /> Xem thông tin thanh toán
          </Button>
        ) : (
          <div className="mt-6 space-y-4">
            {hasPaymentAccount ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                {paymentConfig.qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- QR URL is tenant-configured and may be outside Next image remotePatterns.
                  <img src={paymentConfig.qrImageUrl} alt="QR chuyển khoản gói trải nghiệm" className="mx-auto h-44 w-44 rounded-lg border bg-white object-contain p-2 shadow-sm" />
                ) : (
                  <QrCode className="mx-auto h-44 w-44 rounded-lg border bg-white p-2 text-slate-800 shadow-sm" />
                )}
                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-bold text-slate-900">{paymentConfig.bankName}</p>
                  <p className="text-slate-600">{paymentConfig.accountHolder}</p>
                  <p className="font-bold text-indigo-700">STK: {paymentConfig.accountNumber}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <p className="font-bold">Chưa cấu hình tài khoản nhận tiền công khai.</p>
                <p className="mt-2">Bấm gửi yêu cầu, đội ngũ sẽ gửi QR hoặc số tài khoản qua kênh đã xác nhận. Cách này tránh hiển thị nhầm số tài khoản cho khách.</p>
                {paymentConfig.supportContact && <p className="mt-2">Liên hệ: <strong>{paymentConfig.supportContact}</strong></p>}
              </div>
            )}

            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm">
              <p className="text-slate-500">Nội dung chuyển khoản</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <strong className="text-slate-950">{transferCode}</strong>
                <button type="button" onClick={copyTransferCode} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>

            {isSubmitted ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                Đã ghi nhận yêu cầu. Đội ngũ sẽ đối soát và kích hoạt thủ công sau khi xác nhận thanh toán.
              </div>
            ) : (
              <Button onClick={handleRequestPaymentReview} disabled={isSubmitting} className="w-full bg-emerald-600 font-bold hover:bg-emerald-700">
                {isSubmitting ? 'Đang gửi...' : hasPaymentAccount ? 'Tôi đã chuyển khoản - gửi xác nhận' : 'Gửi yêu cầu nhận QR thanh toán'}
              </Button>
            )}
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-1 text-center text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4" /> Có kiểm tra thủ công trước khi kích hoạt.
        </p>
      </section>
    </div>
  );
}
