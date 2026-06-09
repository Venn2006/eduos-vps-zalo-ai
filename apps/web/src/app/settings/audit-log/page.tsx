import React from 'react';
import Link from 'next/link';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { Prisma, prisma } from '@eduos/db';
import { Activity, Clock, Download, FileText, Filter, RotateCcw, Search, ShieldCheck, User } from 'lucide-react';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATEGORY_ACTIONS: Record<string, string[]> = {
  sales: ['LEAD_', 'SALES_', 'TRIAL_', 'FOLLOW_UP'],
  ai: ['AI_', 'MESSAGE_DRAFT', 'MESSAGE_GUARDRAIL', 'CONVERSATION_'],
  finance: ['FINANCE_', 'PAYMENT_', 'EXPENSE_', 'BILLING_'],
  security: ['PERMISSION_', 'STAFF_', 'CHANNEL_', 'CONNECTOR_', 'AUTH_'],
  system: ['TENANT_', 'CLASS_', 'ATTENDANCE_', 'STUDENT_', 'SANDBOX_'],
};

const CATEGORY_LABELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'sales', label: 'Sales' },
  { id: 'ai', label: 'AI' },
  { id: 'finance', label: 'Finance' },
  { id: 'security', label: 'Bảo mật' },
  { id: 'system', label: 'Hệ thống' },
];

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function buildWhere(tenantId: string, params: Record<string, string | string[] | undefined>) {
  const category = getParam(params, 'category') || 'all';
  const action = getParam(params, 'action').trim();
  const entityType = getParam(params, 'entityType').trim();
  const from = getParam(params, 'from');
  const to = getParam(params, 'to');
  const where: Prisma.AuditLogWhereInput = { tenantId };

  if (action) {
    where.action = { contains: action, mode: 'insensitive' };
  } else if (category !== 'all' && CATEGORY_ACTIONS[category]) {
    where.OR = CATEGORY_ACTIONS[category].map((prefix) => ({
      action: { startsWith: prefix, mode: 'insensitive' },
    }));
  }

  if (entityType) where.entityType = { contains: entityType, mode: 'insensitive' };

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  return where;
}

function buildHref(params: Record<string, string | string[] | undefined>, overrides: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const nextValue = Array.isArray(value) ? value[0] : value;
    if (nextValue) query.set(key, nextValue);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  const suffix = query.toString();
  return `/settings/audit-log${suffix ? `?${suffix}` : ''}`;
}

function getActionLabel(action: string) {
  if (action.startsWith('AI_')) return 'AI / dữ liệu tri thức';
  if (action.startsWith('LEAD_') || action.startsWith('SALES_')) return 'Sales / lead';
  if (action.startsWith('FINANCE_') || action.startsWith('PAYMENT_') || action.startsWith('EXPENSE_')) return 'Tài chính';
  if (action.startsWith('STAFF_') || action.startsWith('PERMISSION_')) return 'Phân quyền';
  if (action.startsWith('SANDBOX_')) return 'Hàng chờ duyệt';
  if (action.startsWith('TENANT_')) return 'Tenant';
  return action.replace(/_/g, ' ').toLowerCase();
}

function summarizeMetadata(metadataJson: string | null) {
  if (!metadataJson) return '';
  try {
    const metadata = JSON.parse(metadataJson) as Record<string, unknown>;
    const entries = Object.entries(metadata)
      .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${String(value)}`);
    return entries.join(' · ');
  } catch {
    return 'Metadata không đúng định dạng JSON';
  }
}

function getHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export default async function AuditLogPage({ searchParams }: Props) {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/settings/audit-log')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const params = await searchParams;
  const tenantId = authSession?.activeTenantId || '';
  const category = getParam(params, 'category') || 'all';
  const where = buildWhere(tenantId, params);
  const retentionDays = Number(process.env.AUDIT_LOG_RETENTION_DAYS || 180);
  const last24h = getHoursAgo(24);
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const nextValue = Array.isArray(value) ? value[0] : value;
    if (nextValue) exportQuery.set(key, nextValue);
  }

  const [totalCount, filteredCount, last24hCount, auditLogs] = await Promise.all([
    prisma.auditLog.count({ where: { tenantId } }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.count({ where: { tenantId, createdAt: { gte: last24h } } }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Audit trail
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Nhật ký hoạt động</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
              Theo dõi thao tác quan trọng theo tenant, lọc theo nhóm nghiệp vụ và xuất CSV cho đối soát hoặc điều tra sự cố.
            </p>
          </div>
          <a
            href={`/api/settings/audit-log/export${exportQuery.toString() ? `?${exportQuery.toString()}` : ''}`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" /> Xuất CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-slate-600 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tổng log tenant</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Đang hiển thị</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{filteredCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">24 giờ gần nhất</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{last24hCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <strong>Retention:</strong> chính sách hiện tại giữ audit log tối thiểu {Number.isFinite(retentionDays) ? retentionDays : 180} ngày. Export CSV giới hạn 1000 dòng mới nhất theo bộ lọc hiện tại.
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_LABELS.map((item) => (
            <Link
              key={item.id}
              href={buildHref(params, { category: item.id })}
              className={`shrink-0 rounded-md border px-3 py-2 text-sm font-bold transition-colors ${
                category === item.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_160px_160px_auto_auto]" action="/settings/audit-log">
          <input type="hidden" name="category" value={category} />
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Action
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="action" defaultValue={getParam(params, 'action')} placeholder="AI_, LEAD_, PAYMENT..." className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Entity
            <input name="entityType" defaultValue={getParam(params, 'entityType')} placeholder="Lead, Staff, Payment..." className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Từ ngày
            <input name="from" type="date" defaultValue={getParam(params, 'from')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Đến ngày
            <input name="to" type="date" defaultValue={getParam(params, 'to')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </label>
          <button className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800" type="submit">
            <Filter className="mr-2 h-4 w-4" /> Lọc
          </button>
          <Link href="/settings/audit-log" className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Link>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {auditLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Activity className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium">Không có audit log khớp bộ lọc.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => {
              const meta = summarizeMetadata(log.metadataJson);
              return (
                <div key={log.id} className="grid gap-3 p-4 transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{getActionLabel(log.action)}</h3>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{log.action}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                          <User className="h-3 w-3" /> {log.actorId ? `User ${log.actorId.slice(0, 8)}...` : 'Hệ thống'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" /> {log.entityType} #{log.entityId.slice(0, 8)}...
                        </span>
                      </div>
                      {meta && <p className="mt-2 break-words text-xs font-medium text-slate-500">{meta}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-500 lg:justify-end">
                    <Clock className="mt-0.5 h-4 w-4" /> {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
