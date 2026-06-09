"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { createExpense } from '../../actions/finance';
import { toast } from 'sonner';

interface CreateExpenseModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateExpenseModal({ onClose, onSuccess }: CreateExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Chi phí Marketing',
    recipientName: '',
    amount: '',
    note: '',
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  const categories = [
    'Chi phí Marketing',
    'Chi phí Lương & Thưởng',
    'Chi phí Mặt bằng',
    'Văn phòng phẩm',
    'Hoàn học phí',
    'Khác'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.amount) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        ...formData,
        amount: Number(formData.amount.replace(/[^0-9]/g, '')),
        expenseDate: new Date(formData.expenseDate),
      });
      toast.success('Tạo phiếu chi thành công');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Lỗi khi tạo phiếu chi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tạo Phiếu Chi Mới</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Loại chi phí</label>
            <select
              className="w-full p-2 border rounded-lg bg-slate-50"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Người nhận / Đối tác *</label>
            <input
              required
              type="text"
              className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors"
              placeholder="VD: Nguyễn Văn A, Công ty B..."
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Số tiền (VNĐ) *</label>
              <input
                required
                type="number"
                className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors"
                placeholder="VD: 5000000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Ngày chi</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors"
                value={formData.expenseDate}
                onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Ghi chú thêm</label>
            <textarea
              className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors h-24 resize-none"
              placeholder="Nội dung chi tiết phiếu chi..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isSubmitting ? 'Đang tạo...' : 'Tạo Phiếu Chi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
