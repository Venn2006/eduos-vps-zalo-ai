import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import Link from 'next/link';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell title="Cài đặt hệ thống" description="Cấu hình Zalo, nhân sự và thanh toán">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/settings/staff"
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Nhân sự & Phân quyền
            </Link>
            <Link
              href="/settings/channels"
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Kết nối Kênh (Zalo)
            </Link>
            <Link
              href="/billing"
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Gói dịch vụ
            </Link>
          </nav>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </PageShell>
  );
}
