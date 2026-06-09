'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, CheckCircle, Clock, MessageCircle, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { GuardrailPreviewCard } from '@/components/conversation/GuardrailPreviewCard';
import { checkMessageQuality } from '@eduos/shared/src/lib/messageQualityGuardrails';
import { transitionSandboxOutboxItem } from '../settings/mock-outbox/actions';

type ApprovalQueueItem = {
  id: string;
  channel: string;
  sourceType: string;
  status: string;
  readinessStatus: string;
  approvalStatus: string | null;
  recipientSafeLabel: string | null;
  messageSafeSummary: string;
  createdAt: string;
};

type ApprovalQueueClientProps = {
  items: ApprovalQueueItem[];
};

const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(new Date(value));

const readinessLabel = (status: string) => {
  if (status === 'SANDBOX_READY' || status === 'READY_FOR_SANDBOX') return 'Đủ điều kiện chờ duyệt';
  if (status === 'BLOCKED') return 'Đang bị chặn';
  if (status === 'NEEDS_REVIEW') return 'Cần kiểm tra';
  return 'Cần kiểm tra';
};

const approvalLabel = (status?: string | null) => {
  if (status === 'APPROVED_FOR_MANUAL_USE') return 'Đã duyệt nội bộ';
  if (status === 'PENDING') return 'Chờ duyệt';
  if (status === 'REJECTED') return 'Từ chối';
  return 'Chưa duyệt';
};

const sourceLabel = (source: string) => {
  if (source === 'FANPAGE_CONVERSATION') return 'Hội thoại Fanpage';
  if (source === 'PAYMENT_REMINDER') return 'Nhắc học phí';
  if (source === 'ATTENDANCE_ALERT') return 'Điểm danh';
  return 'Hệ thống';
};

const draftStatusLabel = (status: string) => {
  if (status === 'MOCK_READY') return 'Chờ duyệt';
  if (status === 'MOCK_QUEUED') return 'Đã xếp hàng';
  if (status === 'MOCK_SENDING') return 'Đang xử lý';
  if (status === 'MOCK_SENT') return 'Đã hoàn tất';
  if (status === 'MOCK_FAILED') return 'Có lỗi';
  if (status === 'MOCK_CANCELLED') return 'Đã hủy';
  return 'Cần kiểm tra';
};

export function ApprovalQueueClient({ items }: ApprovalQueueClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedItem = items.find((item) => item.id === selectedId) || items[0] || null;

  const handleQueue = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const result = await transitionSandboxOutboxItem(selectedItem.id, 'QUEUE');
      if (!result.success) throw new Error(result.error || 'Không thể chuyển vào hàng đợi chờ duyệt');
      toast.success('Đã chuyển vào hàng đợi chờ duyệt');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể duyệt nháp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)]">
      <div className="flex h-full w-1/3 flex-col border-r border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-800">Nháp chờ duyệt sẵn sàng ({items.length})</h3>
          <p className="mt-1 text-xs text-slate-500">Chỉ hiển thị tin nháp đã lưu thật, không dùng dữ liệu mẫu.</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
              <p>Không có nháp chờ duyệt nào cần duyệt.</p>
              <Link href="/team-inbox" className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Mở hộp thư khách hàng
              </Link>
            </div>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`block w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-100 ${selectedItem?.id === item.id ? 'border-l-4 border-l-indigo-600 bg-indigo-50' : 'border-l-4 border-l-transparent bg-white'}`}
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <h4 className="truncate text-sm font-semibold text-slate-800">{item.recipientSafeLabel || item.sourceType}</h4>
                <span className="shrink-0 text-xs text-slate-500">{formatTime(item.createdAt)}</span>
              </div>
              <p className="mb-2 text-xs font-medium text-indigo-600">{item.channel} · {draftStatusLabel(item.status)}</p>
              <p className="line-clamp-2 text-sm text-slate-600">{item.messageSafeSummary}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex h-full w-2/3 flex-col bg-white">
        {selectedItem ? (
          <>
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 p-6">
              <div>
                <h2 className="mb-1 text-lg font-bold text-slate-800">{selectedItem.recipientSafeLabel || selectedItem.sourceType}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center"><MessageCircle className="mr-1 h-4 w-4 text-slate-400" /> {selectedItem.channel}</span>
                  <span className="flex items-center"><Clock className="mr-1 h-4 w-4 text-slate-400" /> Tạo lúc: {formatTime(selectedItem.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center rounded bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
                <Bot className="mr-2 h-4 w-4" /> Nháp chờ duyệt
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Nội dung an toàn</h3>
                <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-800">
                  {selectedItem.messageSafeSummary}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Điều kiện gửi</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{readinessLabel(selectedItem.readinessStatus)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Duyệt nội bộ</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{approvalLabel(selectedItem.approvalStatus)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Nguồn</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{sourceLabel(selectedItem.sourceType)}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Kiểm duyệt an toàn</h3>
                <GuardrailPreviewCard result={checkMessageQuality({
                  message: selectedItem.messageSafeSummary,
                  channel: selectedItem.channel === 'ZALO' ? 'ZALO' : 'FANPAGE',
                  audience: 'PARENT',
                  staffRole: 'SALE',
                })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Link href="/team-inbox" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Mở hộp thư khách hàng
              </Link>
              <button
                type="button"
                onClick={handleQueue}
                disabled={isSubmitting || selectedItem.status !== 'MOCK_READY'}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="mr-2 h-5 w-5" /> {isSubmitting ? 'Đang duyệt...' : 'Duyệt vào hàng đợi chờ duyệt'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-1 flex-col items-center justify-center text-slate-400">
            <XCircle className="mb-4 h-16 w-16 text-slate-200" />
            <p className="text-lg">Không có nháp chờ duyệt nào cần duyệt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
