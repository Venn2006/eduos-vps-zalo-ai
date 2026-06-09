"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import type { TrialBookingStatus } from '@eduos/db';
import { PageShell } from '@/components/layout/PageShell';
import { updateTrialStatus } from '../actions/sales';

export type TrialBookingRow = {
  id: string;
  status: TrialBookingStatus;
  trialDate: string;
  studentName: string;
  parentName: string;
  phone: string;
  courseName: string;
  leadStage: string;
  leadTemperature: string;
};

const statusLabels: Record<TrialBookingStatus, string> = {
  BOOKED: 'Đã xếp lịch',
  REMINDED: 'Đã nhắc lịch',
  ATTENDED: 'Đã đến học',
  NO_SHOW: 'Vắng mặt',
  CANCELLED: 'Đã hủy',
  RESCHEDULED: 'Đã dời lịch',
  CONVERTED: 'Đã chốt',
};

const statusClass: Record<TrialBookingStatus, string> = {
  BOOKED: 'bg-orange-100 text-orange-700',
  REMINDED: 'bg-amber-100 text-amber-700',
  ATTENDED: 'bg-green-100 text-green-700',
  NO_SHOW: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-700',
  RESCHEDULED: 'bg-purple-100 text-purple-700',
  CONVERTED: 'bg-blue-100 text-blue-700',
};

export default function TrialBookingsClient({ initialBookings }: { initialBookings: TrialBookingRow[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (booking: TrialBookingRow, status: TrialBookingStatus) => {
    if (booking.status === status || updatingId) return;

    setUpdatingId(booking.id);
    try {
      await updateTrialStatus(booking.id, status);
      toast.success(`Đã cập nhật: ${statusLabels[status]}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageShell
      title="Học thử"
      description="Quản lý lịch học thử sắp tới và đã qua. Lịch mới được tạo từ luồng Sales Calling để giữ đủ lead, ghi chú và audit."
      action={
        <Link href="/workspaces/sales/calling" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary/90">
          <CalendarPlus className="mr-2 h-4 w-4" /> Đặt lịch từ Sales Calling
        </Link>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="p-4 font-medium">Học viên</th>
              <th className="p-4 font-medium">Phụ huynh</th>
              <th className="p-4 font-medium">Số điện thoại</th>
              <th className="p-4 font-medium">Khóa học</th>
              <th className="p-4 font-medium">Ngày học thử</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Thao tác nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {initialBookings.map((booking) => {
              const isUpdating = updatingId === booking.id;
              return (
                <tr key={booking.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{booking.studentName}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.leadStage} / {booking.leadTemperature}</p>
                  </td>
                  <td className="p-4">{booking.parentName || '-'}</td>
                  <td className="p-4">
                    {booking.phone ? <a href={`tel:${booking.phone}`} className="font-semibold text-indigo-700 hover:underline">{booking.phone}</a> : '-'}
                  </td>
                  <td className="p-4">{booking.courseName || '-'}</td>
                  <td className="p-4">{new Date(booking.trialDate).toLocaleString('vi-VN')}</td>
                  <td className="p-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={isUpdating || booking.status === 'ATTENDED'}
                        onClick={() => handleStatusChange(booking, 'ATTENDED')}
                        className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Đến học
                      </button>
                      <button
                        disabled={isUpdating || booking.status === 'NO_SHOW'}
                        onClick={() => handleStatusChange(booking, 'NO_SHOW')}
                        className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Vắng
                      </button>
                      <button
                        disabled={isUpdating || booking.status === 'CONVERTED'}
                        onClick={() => handleStatusChange(booking, 'CONVERTED')}
                        className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Đánh dấu chốt
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {initialBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">Chưa có lịch học thử nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
