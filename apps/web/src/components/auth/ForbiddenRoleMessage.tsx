import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ForbiddenRoleMessage({ role }: { role?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
        <Lock className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Không có quyền truy cập</h1>
      <div className="max-w-md text-slate-600 space-y-2">
        <p className="font-medium text-red-600">
          Tài khoản của bạn chưa được cấp quyền truy cập khu vực này.
        </p>
        <p>
          Với vai trò <strong>{role || 'Chưa xác định'}</strong>, bạn chỉ có thể truy cập các tính năng thuộc phân hệ được chỉ định. Vui lòng quay lại Danh mục công việc để tiếp tục.
        </p>
      </div>
      <Link href="/workspaces">
        <Button className="mt-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Về Danh mục công việc
        </Button>
      </Link>
    </div>
  );
}
