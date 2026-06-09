import React from 'react';
import { AlertTriangle, Bot, CheckCircle2, CreditCard, MessageSquare, ShieldCheck } from 'lucide-react';

export type SafetyMetric = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  status: 'safe' | 'warning' | 'blocked';
  icon: 'message' | 'finance' | 'ai' | 'shield';
};

const iconMap = {
  message: <MessageSquare className="h-6 w-6 text-blue-600" />,
  finance: <CreditCard className="h-6 w-6 text-rose-600" />,
  ai: <Bot className="h-6 w-6 text-purple-600" />,
  shield: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
};

const bgMap = {
  message: 'bg-blue-100',
  finance: 'bg-rose-100',
  ai: 'bg-purple-100',
  shield: 'bg-emerald-100',
};

export function SafetyCenterClient({ metrics }: { metrics: SafetyMetric[] }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="border-b pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <ShieldCheck className="h-8 w-8 text-emerald-600" /> Trung tâm an toàn & tự động hóa
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Trạng thái đọc từ dữ liệu thật. Không có công tắc chỉ đổi trên giao diện; mọi thay đổi tự động hóa cần đi qua cấu hình có ghi lịch sử.
        </p>
      </div>

      <div className="grid gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`${bgMap[metric.icon]} shrink-0 rounded-full p-3`}>{iconMap[metric.icon]}</div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-bold text-slate-800">{metric.title}</h3>
              <p className="mb-4 text-sm text-slate-600">{metric.description}</p>
              <StatusBadge status={metric.status} label={metric.statusLabel} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: SafetyMetric['status']; label: string }) {
  const className = status === 'safe'
    ? 'bg-emerald-100 text-emerald-700'
    : status === 'warning'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-rose-100 text-rose-700';
  const icon = status === 'safe' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;

  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${className}`}>{icon}{label}</span>;
}
