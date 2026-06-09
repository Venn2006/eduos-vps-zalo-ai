'use client';

import Link from 'next/link';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import {
  Wifi,
  WifiOff,
  AlertCircle,
  MessageSquare,
  Users,
  Phone,
  Clock,
  Eye,
  Settings,
  QrCode,
  Unplug,
  Activity,
  TrendingUp,
  Plus,
  Smartphone,
  Shield,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ZaloAccountWithSession = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: string;
  lastHeartbeat: string;
  connectorLabel: string;
  sessionId: string | null;
  avatarColor: string;
};

export type ZaloTenantStats = {
  connectedGroups: number;
  unprocessedMessages: number;
  messagesToday: number;
  onlineAccounts: number;
  totalAccounts: number;
  latestHeartbeat: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  ONLINE: {
    label: 'Đang hoạt động',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <Wifi className="h-3.5 w-3.5" />,
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
    icon: <WifiOff className="h-3.5 w-3.5" />,
  },
  NEEDS_RELOGIN: {
    label: 'Cần đăng nhập lại',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

const fallbackStatus = {
  label: 'Chưa rõ trạng thái',
  color: 'text-slate-500',
  bg: 'bg-slate-50 border-slate-200',
  icon: <AlertCircle className="h-3.5 w-3.5" />,
};

export default function ZaloAccountsClient({
  initialAccounts,
  tenantStats,
}: {
  initialAccounts: ZaloAccountWithSession[];
  tenantStats: ZaloTenantStats;
}) {
  const connectorOnline = tenantStats.onlineAccounts > 0;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Zalo Accounts Workspace"
        description="Quản lý tài khoản Zalo cá nhân và trạng thái VPS connector của trung tâm. Token phiên không hiển thị trên giao diện."
        action={
          <Link href="/settings/zalo-accounts" className={cn(buttonVariants({ size: 'sm' }), 'shadow-md')}>
            <Plus className="mr-2 h-4 w-4" />
            Cấu hình tài khoản
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Tài khoản online',
            value: String(tenantStats.onlineAccounts) + '/' + String(tenantStats.totalAccounts),
            icon: <Wifi className="h-5 w-5 text-emerald-500" />,
            color: 'text-emerald-600',
          },
          {
            label: 'Group đang kết nối',
            value: tenantStats.connectedGroups,
            icon: <Users className="h-5 w-5 text-blue-500" />,
            color: 'text-blue-600',
          },
          {
            label: 'Tin chưa xử lý',
            value: tenantStats.unprocessedMessages,
            icon: <MessageSquare className="h-5 w-5 text-rose-500" />,
            color: 'text-rose-600',
          },
          {
            label: 'Tin nhắn hôm nay',
            value: tenantStats.messagesToday,
            icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
            color: 'text-purple-600',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-slate-50 p-2">{stat.icon}</div>
              <div>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {initialAccounts.map((account) => {
          const st = statusConfig[account.status] ?? fallbackStatus;

          return (
            <Card key={account.id} className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-md',
                        account.avatarColor,
                      )}
                    >
                      {account.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{account.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        {account.phone}
                      </p>
                    </div>
                  </div>
                  <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', st.color, st.bg)}>
                    {st.icon}
                    {st.label}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{account.connectorLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Heartbeat: {account.lastHeartbeat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-slate-400" />
                    <span>Session/token được giữ server-side</span>
                  </div>
                  {account.sessionId && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono text-[10px]">{account.sessionId}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/zalo-inbox" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Inbox
                  </Link>
                  <Link href="/zalo-groups" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Groups
                  </Link>
                </div>

                {account.status === 'NEEDS_RELOGIN' ? (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    <QrCode className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>QR Login thật cần thao tác trong VPS connector. Vào phần cài đặt để kiểm tra phiên và cấp lại quyền.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    <Unplug className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Ngắt/kết nối lại tài khoản được khóa trong pilot; chỉ thao tác ở cấu hình connector khi có VPS thật.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Link href="/settings/zalo-accounts" className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Cấu hình tài khoản Zalo</p>
            <p className="mt-1 text-xs">Xem phiên VPS connector đang lưu trong tenant</p>
          </div>
        </Link>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4 text-primary" />
            Thiết bị VPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between', connectorOnline ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50')}>
            <div className="flex items-center gap-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', connectorOnline ? 'bg-emerald-100' : 'bg-slate-100')}>
                <Activity className={cn('h-5 w-5', connectorOnline ? 'text-emerald-600' : 'text-slate-500')} />
              </div>
              <div>
                <p className="font-bold text-slate-800">VPS connector theo tenant</p>
                <p className="text-xs text-slate-500">
                  {tenantStats.onlineAccounts} tài khoản online / {tenantStats.totalAccounts} đã khai báo · Heartbeat mới nhất: {tenantStats.latestHeartbeat}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', connectorOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600')}>
                {connectorOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {connectorOnline ? 'Có tài khoản online' : 'Chưa có tài khoản online'}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                Không hiển thị uptime giả
              </span>
              <Link href="/settings/zalo-accounts" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <Settings className="h-3.5 w-3.5" />
                Cấu hình
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
