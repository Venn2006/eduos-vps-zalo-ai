'use client';

import React, { useState } from 'react';
import { logCallOutcome } from './actions';
import { CallOutcome } from '@prisma/client';
import { CheckCircle2, Clock } from 'lucide-react';

interface CallOutcomeFormProps {
  leadId: string;
}

export function CallOutcomeForm({ leadId }: CallOutcomeFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const outcomes: { label: string; value: CallOutcome; colorClass: string }[] = [
    { label: 'Không nghe máy', value: 'NO_ANSWER', colorClass: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' },
    { label: 'Sai số', value: 'WRONG_NUMBER', colorClass: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' },
    { label: 'Quan tâm', value: 'INTERESTED', colorClass: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { label: 'Hẹn gọi lại', value: 'BUSY_CALLBACK', colorClass: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
    { label: 'Đặt học thử', value: 'BOOKED_TRIAL', colorClass: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
    { label: 'Từ chối', value: 'NOT_INTERESTED', colorClass: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
    { label: 'Đã đóng tiền', value: 'PAID', colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
  ];

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');
    setSuccess(false);

    try {
      const result = await logCallOutcome(formData);
      if (result.success) {
        setSuccess(true);
        // Form clears naturally on revalidatePath, but we can hold success state briefly
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Lỗi không xác định');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="bg-white px-4 py-2 mb-4 rounded border shadow-sm text-sm font-semibold text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Phase 13.3: Ghi nhận kết quả cuộc gọi. Tạo follow-up và lịch học thử sẽ làm ở phase sau.</span>
        </div>
        {success && (
          <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
            <CheckCircle2 className="w-4 h-4" /> Đã lưu!
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      <input type="hidden" name="leadId" value={leadId} />

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú cuộc gọi (Không bắt buộc)</label>
        <textarea 
          id="notes"
          name="notes" 
          rows={2} 
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Nhập chi tiết tư vấn hoặc yêu cầu của khách hàng..."
        ></textarea>
      </div>
      
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Ghi nhận kết quả (Click để lưu)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {outcomes.map((o) => (
            <button 
              key={o.value} 
              type="submit" 
              name="outcome" 
              value={o.value}
              disabled={isPending}
              className={`py-2.5 px-3 border rounded-lg text-sm font-semibold transition-colors shadow-sm ${o.colorClass} disabled:opacity-50`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
