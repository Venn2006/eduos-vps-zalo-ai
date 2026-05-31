"use client";

import React, { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { updateTrialStatus } from '../actions/sales';
import { TrialBookingStatus } from '@eduos/db';

export default function TrialBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (id: string, status: TrialBookingStatus) => {
    if (!confirm(`Xác nhận đổi trạng thái thành ${status}?`)) return;
    setIsUpdating(true);
    try {
      await updateTrialStatus(id, status);
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageShell 
      title="Học thử" 
      description="Quản lý lịch học thử sắp tới và đã qua."
      primaryAction="Thêm lịch"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500">
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
            {initialBookings.map(b => (
              <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="p-4">
                  <p className="font-medium">{b.studentNameSnapshot || b.lead.name}</p>
                </td>
                <td className="p-4">{b.parentNameSnapshot || '-'}</td>
                <td className="p-4">{b.phoneSnapshot || '-'}</td>
                <td className="p-4">{b.course?.name || '-'}</td>
                <td className="p-4">{new Date(b.trialDate).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    b.status === 'ATTENDED' ? 'bg-green-100 text-green-700' : 
                    b.status === 'NO_SHOW' ? 'bg-red-100 text-red-700' : 
                    b.status === 'CONVERTED' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {b.status === 'BOOKED' ? 'Đã xếp lịch' :
                     b.status === 'ATTENDED' ? 'Đã đến học' :
                     b.status === 'NO_SHOW' ? 'Vắng mặt' :
                     b.status === 'CONVERTED' ? 'Thành công' : b.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(b.id, 'ATTENDED')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-xs border border-emerald-200 px-2 py-1 rounded bg-emerald-50"
                  >
                    Đến học
                  </button>
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(b.id, 'NO_SHOW')}
                    className="text-red-600 hover:text-red-700 font-medium text-xs border border-red-200 px-2 py-1 rounded bg-red-50"
                  >
                    Vắng
                  </button>
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(b.id, 'CONVERTED')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50"
                  >
                    Chốt Sale
                  </button>
                </td>
              </tr>
            ))}
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
