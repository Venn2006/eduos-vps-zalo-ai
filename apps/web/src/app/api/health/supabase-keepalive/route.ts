import { NextResponse } from 'next/server';
import { prisma } from '@eduos/db';

export const dynamic = 'force-dynamic';

function getKeepaliveSecret() {
  return process.env.SUPABASE_KEEPALIVE_SECRET || process.env.CRON_SECRET || '';
}

export async function GET(req: Request) {
  const configuredSecret = getKeepaliveSecret();
  const providedSecret = req.headers.get('x-keepalive-secret') || '';

  if (!configuredSecret) {
    return NextResponse.json({ ok: false, error: 'Keepalive secret is not configured' }, { status: 503 });
  }

  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;

  return NextResponse.json({
    ok: true,
    service: 'supabase-keepalive',
    checkedAt: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
  });
}
