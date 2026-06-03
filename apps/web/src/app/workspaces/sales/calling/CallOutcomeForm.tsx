'use client';

import React, { useState } from 'react';
import { logCallOutcome } from './actions';
import { CallOutcome } from '@prisma/client';
import { CheckCircle2, Clock, Copy } from 'lucide-react';
import { getSuggestionForOutcome } from '@eduos/shared/src/lib/salesCallingSuggestions';

interface CallOutcomeFormProps {
  leadId: string;
}

export function CallOutcomeForm({ leadId }: CallOutcomeFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedOutcome, setSubmittedOutcome] = useState<CallOutcome | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);

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
    setSubmittedOutcome(null);

    const outcomeVal = formData.get('outcome') as CallOutcome | null;

    try {
      const result = await logCallOutcome(formData);
      if (result.success) {
        setSuccess(true);
        setSubmittedOutcome(outcomeVal);
        setShowBookingForm(false);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || 'Lỗi không xác định');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống');
    } finally {
      setIsPending(false);
    }
  }

  const suggestion = getSuggestionForOutcome(submittedOutcome);

  const handleCopy = () => {
    if (suggestion?.copy) {
      navigator.clipboard.writeText(suggestion.copy);
    }
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="bg-white px-4 py-2 mb-4 rounded border shadow-sm text-sm font-semibold text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Một số kết quả như Không nghe máy hoặc Hẹn gọi lại sẽ tự tạo việc cần làm tiếp theo. Lịch học thử sẽ tự động tạo Booking.</span>
        </div>
        {success && (
          <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded transition-opacity">
            <CheckCircle2 className="w-4 h-4" /> Đã lưu!
          </span>
        )}
      </div>

      {submittedOutcome && suggestion && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
            {suggestion.label}
          </h4>
          <div className="relative">
            <textarea 
              readOnly 
              className="w-full bg-white border border-indigo-100 rounded p-3 text-sm text-slate-700 outline-none resize-none pr-24" 
              rows={3} 
              value={suggestion.copy}
            />
            {suggestion.isMessageSuggested && (
              <button 
                type="button" 
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded flex items-center gap-1.5 text-xs font-bold transition-colors"
              >
                <Copy className="w-3 h-3" /> Sao chép
              </button>
            )}
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium italic">Chỉ là gợi ý. Chưa gửi cho phụ huynh.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {showBookingForm ? (
        <form action={handleSubmit} className="border border-green-200 bg-green-50/30 p-4 rounded-xl">
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="outcome" value="BOOKED_TRIAL" />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Đặt lịch học thử</h3>
            <button type="button" onClick={() => setShowBookingForm(false)} className="text-sm text-slate-500 hover:text-slate-800">
              Huỷ
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4 font-medium italic">Thông tin này chỉ tạo lịch nội bộ, chưa gửi tin nhắn cho phụ huynh.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày giờ học thử <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="trialDate" required className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên học sinh (Nếu có)</label>
              <input type="text" name="studentName" placeholder="Tên bé..." className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú (Ghi rõ cơ sở, lớp học)</label>
              <textarea name="notes" rows={2} placeholder="Ví dụ: Lớp Kids 1 cơ sở 1..." className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"></textarea>
            </div>
          </div>
          
          <button type="submit" disabled={isPending} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Lưu kết quả & Tạo lịch học thử
          </button>
        </form>
      ) : (
        <form action={handleSubmit}>
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
                  type={o.value === 'BOOKED_TRIAL' ? 'button' : 'submit'}
                  name={o.value === 'BOOKED_TRIAL' ? undefined : 'outcome'}
                  value={o.value === 'BOOKED_TRIAL' ? undefined : o.value}
                  onClick={o.value === 'BOOKED_TRIAL' ? () => setShowBookingForm(true) : undefined}
                  disabled={isPending}
                  className={`py-2.5 px-3 border rounded-lg text-sm font-semibold transition-colors shadow-sm ${o.colorClass} disabled:opacity-50`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
