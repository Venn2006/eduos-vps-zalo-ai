"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Plus,
  ShieldCheck,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'DATA' | 'SCRIPTS' | 'ZALO_CONFIG';

export type AiKnowledgeItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AiPromptTemplateItem = {
  id: string;
  purpose: string;
  template: string;
};

export type ZaloConnectorSessionItem = {
  id: string;
  status: string;
  lastPing: string | null;
  accountName: string;
  phoneNumber: string;
};

type AiKnowledgeBaseClientProps = {
  knowledgeItems: AiKnowledgeItem[];
  promptTemplates: AiPromptTemplateItem[];
  connectorSessions: ZaloConnectorSessionItem[];
};

const formatDateTime = (value: string | null) => {
  if (!value) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const connectorBadgeVariant = (status: string) => status === 'ONLINE' ? 'success' : status === 'OFFLINE' ? 'warning' : 'outline';

export function AiKnowledgeBaseClient({ knowledgeItems, promptTemplates, connectorSessions }: AiKnowledgeBaseClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('DATA');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  async function handleCreateKnowledge(formData: FormData) {
    setIsSaving(true);
    const payload = {
      category: String(formData.get('category') || 'FAQ').trim() || 'FAQ',
      title: String(formData.get('title') || '').trim(),
      content: String(formData.get('content') || '').trim(),
    };

    try {
      const response = await fetch('/api/ai-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || 'Không lưu được dữ liệu AI');
      }

      toast.success('Đã lưu dữ liệu AI vào DB');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không lưu được dữ liệu AI');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteKnowledge(id: string) {
    setIsDeletingId(id);
    try {
      const response = await fetch(`/api/ai-knowledge/${id}`, { method: 'DELETE' });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || 'Không xóa được dữ liệu AI');
      }

      toast.success('Đã xóa dữ liệu AI khỏi DB');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không xóa được dữ liệu AI');
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-black text-slate-950">
              <Database className="h-7 w-7 text-indigo-600" /> Trung tâm đào tạo AI
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium kháching-6 text-slate-600">
              Chỉ hiển thị dữ liệu đã lưu trong tenant hiện tại. Tài liệu file/link và auto training chưa bật thì được khóa rõ ràng.
            </p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
            {[
              ['DATA', 'Nguồn dữ liệu'],
              ['SCRIPTS', 'Prompt template'],
              ['ZALO_CONFIG', 'Kết nối'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as TabType)}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold transition-colors ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="bg-slate-50 p-0">
        {activeTab === 'DATA' && (
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[360px_1fr]">
            <form action={handleCreateKnowledge} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Plus className="h-4 w-4 text-indigo-600" /> Thêm FAQ / quy định
                </h3>
                <p className="mt-1 text-sm text-slate-500">Lưu thẳng vào bảng AiKnowledgeBase. Chưa có upload file tự động.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nhóm dữ liệu</label>
                <input name="category" defaultValue="FAQ" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tiêu đề</label>
                <input name="title" required maxLength={160} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nội dung</label>
                <textarea name="content" required rows={7} maxLength={12000} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <Button type="submit" disabled={isSaving} className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" /> {isSaving ? 'Đang lưu...' : 'Lưu vào DB'}
              </Button>
            </form>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dữ liệu AI đã lưu</h3>
                  <p className="text-sm text-slate-500">{knowledgeItems.length} bản ghi trong tenant hiện tại.</p>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-600">DB-backed</Badge>
              </div>
              {knowledgeItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Chưa có dữ liệu AI nào. Hãy thêm FAQ thật trước khi cho AI trả lời trong dùng thử.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {knowledgeItems.map((item) => (
                    <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          <span className="font-semibold text-slate-900">{item.title}</span>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600">{item.category}</Badge>
                        </div>
                        <p className="line-clamp-2 text-sm kháching-6 text-slate-600">{item.content}</p>
                        <p className="mt-2 text-xs text-slate-400">Cập nhật: {formatDateTime(item.updatedAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteKnowledge(item.id)}
                        disabled={isDeletingId === item.id}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-200 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> {isDeletingId === item.id ? 'Đang xóa' : 'Xóa'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'SCRIPTS' && (
          <div className="p-6">
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Prompt template ở đây là cấu hình đọc từ DB. Chưa có nút bật/tắt local để tránh khách tưởng đã kích hoạt automation thật.
            </div>
            {promptTemplates.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có AiPromptTemplate trong tenant này.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {promptTemplates.map((template) => (
                  <div key={template.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-900">{template.purpose}</h3>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600">Chỉ xem</Badge>
                    </div>
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm kháching-6 text-slate-600">{template.template}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ZALO_CONFIG' && (
          <div className="p-6">
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
              Trang này chỉ đọc trạng thái kết nối. Việc gửi thật vẫn phải đi qua Hàng chờ duyệt, Approval Queue và kiểm tra production readiness.
            </div>
            {connectorSessions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có kết nối Zalo nào được thiết lập.</div>
            ) : (
              <div className="space-y-3">
                {connectorSessions.map((session) => (
                  <div key={session.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      {session.status === 'ONLINE' ? <Wifi className="mt-1 h-5 w-5 text-emerald-600" /> : <WifiOff className="mt-1 h-5 w-5 text-amber-600" />}
                      <div>
                        <h3 className="font-bold text-slate-900">{session.accountName}</h3>
                        <p className="text-sm text-slate-500">{session.phoneNumber} • Ping cuối: {formatDateTime(session.lastPing)}</p>
                      </div>
                    </div>
                    <Badge variant={connectorBadgeVariant(session.status)}>{session.status}</Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900"><Bot className="h-4 w-4 text-indigo-600" /> Auto reply</div>
                <p className="mt-1 text-sm text-slate-500">Không có công tắc local. Chỉ bật khi có cấu hình automation và outbox approval thật.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-indigo-600" /> Smart handoff</div>
                <p className="mt-1 text-sm text-slate-500">Đang ở chế độ kiểm soát an toàn, không tự gửi tin ra kết nối thật.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
