import { NextResponse } from 'next/server';
import { Prisma, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';

const CATEGORY_ACTIONS: Record<string, string[]> = {
  sales: ['LEAD_', 'SALES_', 'TRIAL_', 'FOLLOW_UP'],
  ai: ['AI_', 'MESSAGE_DRAFT', 'MESSAGE_GUARDRAIL', 'CONVERSATION_'],
  finance: ['FINANCE_', 'PAYMENT_', 'EXPENSE_', 'BILLING_'],
  security: ['PERMISSION_', 'STAFF_', 'CHANNEL_', 'CONNECTOR_', 'AUTH_'],
  system: ['TENANT_', 'CLASS_', 'ATTENDANCE_', 'STUDENT_', 'SANDBOX_'],
};

const SENSITIVE_KEY_PATTERN = /(password|secret|token|api[_-]?key|authorization|cookie|hash|signature)/i;

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function redactJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactJsonValue(item));

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactJsonValue(item),
      ])
    );
  }

  return value;
}

function redactSerializedJson(value: string | null) {
  if (!value) return '';

  try {
    return JSON.stringify(redactJsonValue(JSON.parse(value)));
  } catch {
    return SENSITIVE_KEY_PATTERN.test(value) ? '[REDACTED]' : value;
  }
}

function buildWhere(tenantId: string, searchParams: URLSearchParams) {
  const category = searchParams.get('category') || 'all';
  const action = searchParams.get('action')?.trim();
  const entityType = searchParams.get('entityType')?.trim();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
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

export async function GET(request: Request) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    const url = new URL(request.url);
    const logs = await prisma.auditLog.findMany({
      where: buildWhere(session.activeTenantId, url.searchParams),
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const rows = [
      ['createdAt', 'actorId', 'action', 'entityType', 'entityId', 'metadataJson'],
      ...logs.map((log) => [
        log.createdAt.toISOString(),
        log.actorId || 'system',
        log.action,
        log.entityType,
        log.entityId,
        redactSerializedJson(log.metadataJson),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="audit-log-export.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Audit log export failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
