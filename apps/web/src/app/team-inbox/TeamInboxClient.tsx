"use client";

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';

import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';

type ConversationRow = {
  id: string;
  psid: string;
  pageName: string;
  lastMessageAt: string;
  lastText: string;
  messageCount: number;
  lead: {
    id: string;
    name: string;
    stage: string;
    temperature: string;
  } | null;
};

type OutboxRow = {
  id: string;
  channel: string;
  status: string;
  readinessStatus: string;
  approvalStatus: string | null;
  recipientSafeLabel: string | null;
  messageSafeSummary: string;
  createdAt: string;
};

type TeamInboxClientProps = {
  conversations: ConversationRow[];
  outboxItems: OutboxRow[];
  openTaskCount: number;
};

const stageLabel = (stage?: string) => {
  if (stage === 'WON') return 'Đã chốt';
  if (stage === 'BOOKED_TRIAL') return 'Đã đặt học thử';
  if (stage === 'ATTENDED_TRIAL') return 'Đã học thử';
  if (stage === 'QUALIFIED') return 'Tiềm năng';
  if (stage === 'CONTACTED') return 'Đã liên hệ';
  if (stage === 'LOST') return 'Mất cơ hội';
  if (stage === 'NEW') return 'Mới';
  return stage || 'Chưa có khách';
};

const stageStatus = (stage?: string): StatusType => {
  if (stage === 'WON') return 'success';
  if (stage === 'LOST') return 'danger';
  if (stage === 'BOOKED_TRIAL' || stage === 'ATTENDED_TRIAL') return 'primary';
  if (stage === 'QUALIFIED' || stage === 'CONTACTED') return 'info';
  return 'neutral';
};

const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(new Date(value));

const draftStatusLabel = (status: string) => {
  if (status === 'MOCK_READY') return 'Chờ duyệt';
  if (status === 'MOCK_QUEUED') return 'Đã xếp hàng';
  if (status === 'MOCK_SENDING') return 'Đang xử lý';
  if (status === 'MOCK_SENT') return 'Đã hoàn tất';
  if (status === 'MOCK_FAILED') return 'Có lỗi';
  if (status === 'MOCK_CANCELLED') return 'Đã hủy';
  return 'Cần kiểm tra';
};

export function TeamInboxClient({ conversations, outboxItems, openTaskCount }: TeamInboxClientProps) {
  const [filter, setFilter] = useState<'ALL' | 'LEAD' | 'HOT' | 'NO_LEAD'>('ALL');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(conversations[0]?.id || null);

  const filteredConversations = useMemo(() => conversations.filter((conversation) => {
    if (filter === 'LEAD') return !!conversation.lead;
    if (filter === 'HOT') return conversation.lead?.temperature === 'HOT';
    if (filter === 'NO_LEAD') return !conversation.lead;
    return true;
  }), [conversations, filter]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConvId) || filteredConversations[0] || null;
  const linkedKháchCount = conversations.filter((conversation) => conversation.lead).length;
  const hotKháchCount = conversations.filter((conversation) => conversation.lead?.temperature === 'HOT').length;
  const readyOutboxCount = outboxItems.filter((item) => item.status === 'MOCK_READY').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <MessageSquare className="h-7 w-7 text-primary" />
            Tin nhắn & Zalo
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Trung tâm điều phối dữ liệu thật từ Fanpage Inbox, Hàng chờ duyệt và việc chăm sóc. Kết nối Zalo thật chưa được bật nên không hiển thị tin giả.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/fanpage-inbox" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            Mở Fanpage Inbox <ExternalLink className="h-4 w-4" />
          </Link>
          <Link href="/approval-queue" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Hàng chờ duyệt <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard title="Hội thoại Fanpage" value={conversations.length} icon={<Inbox className="h-5 w-5" />} color="primary" />
        <MetricCard title="Khách đã liên kết" value={linkedKháchCount} icon={<User className="h-5 w-5" />} color="success" />
        <MetricCard title="Khách nóng" value={hotKháchCount} icon={<Bot className="h-5 w-5" />} color="warning" />
        <MetricCard title="Tin chờ duyệt" value={readyOutboxCount} icon={<ShieldCheck className="h-5 w-5" />} color="info" />
        <MetricCard title="Việc đang mở" value={openTaskCount} icon={<CheckCircle2 className="h-5 w-5" />} color="default" />
      </div>

      <div className="grid min-h-[620px] gap-6 lg:grid-cols-[280px_minmax(320px,420px)_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Kênh dữ liệu</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
                <span>Facebook Fanpage</span>
                <span className="font-bold">{conversations.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-slate-600">
                <span>Zalo OA/Hotline</span>
                <span className="text-xs font-semibold">Chưa nối thật</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-blue-800">
                <span>Hàng chờ duyệt</span>
                <span className="font-bold">{outboxItems.length}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <h2 className="mb-2 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" /> Trạng thái an toàn</h2>
            <p>Trang này chỉ điều phối dữ liệu đã lưu thật. Tin nhắn ra ngoài được đưa qua Hàng chờ duyệt, không gọi kết nối thật.</p>
          </section>
        </aside>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2">
              {[
                ['ALL', 'Tất cả'],
                ['LEAD', 'Có khách'],
                ['HOT', 'Nóng'],
                ['NO_LEAD', 'Chưa có khách'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as typeof filter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filter === value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConvId(conversation.id)}
                className={`block w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${selectedConversation?.id === conversation.id ? 'bg-primary/5' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{conversation.lead?.name || `Khách FB ${conversation.psid.slice(0, 8)}`}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{conversation.pageName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatTime(conversation.lastMessageAt)}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{conversation.lastText || 'Chưa có nội dung tin nhắn'}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusBadge status={stageStatus(conversation.lead?.stage)} label={stageLabel(conversation.lead?.stage)} />
                  <span className="text-xs text-slate-500">{conversation.messageCount} tin</span>
                </div>
              </button>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">Không có hội thoại phù hợp bộ lọc.</div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {selectedConversation ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedConversation.lead?.name || `Khách FB ${selectedConversation.psid}`}</h2>
                    <p className="mt-1 text-sm text-slate-500">{selectedConversation.pageName} · {formatTime(selectedConversation.lastMessageAt)}</p>
                  </div>
                  <StatusBadge status={stageStatus(selectedConversation.lead?.stage)} label={stageLabel(selectedConversation.lead?.stage)} />
                </div>
              </div>

              <div className="flex-1 space-y-5 p-5">
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Tin mới nhất</h3>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{selectedConversation.lastText || 'Chưa có nội dung'}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/fanpage-inbox" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Mở hội thoại trong Fanpage Inbox
                  </Link>
                  <Link href="/tasks" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Xem việc chăm sóc
                  </Link>
                  <Link href="/leads" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Mở danh sách khách
                  </Link>
                  <Link href="/approval-queue" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Kiểm tra Hàng chờ duyệt
                  </Link>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Clock className="h-4 w-4" /> Tin nháp gần đây</h3>
                  <div className="space-y-2">
                    {outboxItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                          <span>{item.channel} · {draftStatusLabel(item.status)}</span>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-700">{item.messageSafeSummary}</p>
                      </div>
                    ))}
                    {outboxItems.length === 0 && <p className="text-sm text-slate-500">Chưa có tin nào trong Hàng chờ duyệt.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center text-center text-slate-400">
              <MessageSquare className="mb-3 h-12 w-12 text-slate-200" />
              <p>Chưa có hội thoại thật để hiển thị.</p>
              <Link href="/fanpage-inbox" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">Mở Fanpage Inbox</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
