"use client";
import React, { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Wifi, WifiOff, AlertCircle, MessageSquare, Users, Phone, Clock,
  Eye, Settings, QrCode, Unplug, Activity, TrendingUp, RefreshCw,
  Plus, Smartphone, Shield, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ZaloAccountWithSession = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: string;
  connectedGroups: number;
  unreadConversations: number;
  messagesToday: number;
  lastHeartbeat: string;
  device: string;
  sessionId: string | null;
  accountType: string;
  avatarColor: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  ONLINE: {
    label: 'Đang hoạt động',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <Wifi className="w-3.5 h-3.5" />,
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
    icon: <WifiOff className="w-3.5 h-3.5" />,
  },
  NEEDS_RELOGIN: {
    label: 'Cần đăng nhập lại',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

export default function ZaloAccountsClient({ initialAccounts }: { initialAccounts: ZaloAccountWithSession[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const totalMessages = initialAccounts.reduce((s, a) => s + a.messagesToday, 0);
  const totalGroups = initialAccounts.reduce((s, a) => s + a.connectedGroups, 0);
  const totalUnread = initialAccounts.reduce((s, a) => s + a.unreadConversations, 0);
  const onlineCount = initialAccounts.filter(a => a.status === 'ONLINE').length;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Zalo Accounts Workspace"
        description="Quản lý tài khoản Zalo cá nhân của trung tâm"
        action={
          <Button size="sm" className="shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Thêm tài khoản
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tài khoản Online', value: `${onlineCount}/${initialAccounts.length}`, icon: <Wifi className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Group đang kết nối', value: totalGroups, icon: <Users className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
          { label: 'Chưa đọc', value: totalUnread, icon: <MessageSquare className="w-5 h-5 text-rose-500" />, color: 'text-rose-600' },
          { label: 'Tin nhắn hôm nay', value: totalMessages, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50">{stat.icon}</div>
              <div>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialAccounts.map((account) => {
          const st = statusConfig[account.status];
          const isSelected = selected === account.id;
          return (
            <Card
              key={account.id}
              onClick={() => setSelected(isSelected ? null : account.id)}
              className={cn(
                'border-2 shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5',
                isSelected ? 'border-primary shadow-primary/20' : 'border-transparent hover:border-slate-200'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-md',
                      account.avatarColor
                    )}>
                      {account.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{account.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" />{account.phone}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
                    st.color, st.bg
                  )}>
                    {st.icon}{st.label}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Groups', value: account.connectedGroups, icon: <Users className="w-4 h-4" /> },
                    { label: 'Chưa đọc', value: account.unreadConversations, icon: <MessageSquare className="w-4 h-4" /> },
                    { label: 'Hôm nay', value: account.messagesToday, icon: <Activity className="w-4 h-4" /> },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-50 rounded-xl py-2.5 px-1">
                      <div className="flex justify-center text-slate-400 mb-1">{m.icon}</div>
                      <p className="text-xl font-bold text-slate-800">{m.value}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{account.device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Heartbeat: {account.lastHeartbeat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>{account.accountType}</span>
                  </div>
                  {account.sessionId && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-[10px]">{account.sessionId}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />Inbox
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    <Users className="w-3.5 h-3.5 mr-1.5" />Groups
                  </Button>
                  {account.status === 'NEEDS_RELOGIN' ? (
                    <Button size="sm" className="flex-1 text-xs h-8 bg-amber-500 hover:bg-amber-600 border-0 text-white">
                      <QrCode className="w-3.5 h-3.5 mr-1.5" />QR Login
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8 text-rose-600 hover:bg-rose-50 hover:border-rose-300">
                      <Unplug className="w-3.5 h-3.5 mr-1.5" />Ngắt
                    </Button>
                  )}
                </div>

                {account.status === 'NEEDS_RELOGIN' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Phiên đăng nhập đã hết hạn. Nhấn <strong>QR Login</strong> để kết nối lại. (Tính năng sẽ yêu cầu VPS thật.)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add account placeholder */}
        <Card className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50 hover:bg-primary/5 min-h-[280px]">
          <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Thêm tài khoản Zalo</p>
              <p className="text-xs mt-1">Kết nối thêm tài khoản Zalo cá nhân qua VPS</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VPS Device Status */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            Thiết bị VPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">VPS-01 (Hanoi)</p>
                <p className="text-xs text-slate-500">2 tài khoản đang kết nối · Uptime 99.8%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 animate-pulse" />Online
              </span>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Kiểm tra
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-3.5 h-3.5 mr-1.5" />Cấu hình
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
