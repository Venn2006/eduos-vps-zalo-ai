import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

export async function POST(req: Request) {
  try {
    const guard = await protectMutation(req, 'settings-channels', { limit: 20, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const body = await req.json();
    const zaloOaAppId = typeof body.zaloOaAppId === 'string' ? body.zaloOaAppId.trim() : '';
    const zaloOaToken = typeof body.zaloOaToken === 'string' ? body.zaloOaToken.trim() : '';

    if (
      (zaloOaAppId && String(zaloOaAppId).length > 120) ||
      (zaloOaToken && String(zaloOaToken).length > 4096)
    ) {
      return NextResponse.json({ error: 'Channel credentials are too large' }, { status: 413 });
    }

    const before = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { zaloOaAppId: true, zaloOaToken: true },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        zaloOaAppId,
        ...(zaloOaToken ? { zaloOaToken } : {})
      }
    });

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'CHANNEL_SETTINGS_UPDATED',
      entityType: 'Tenant',
      entityId: tenantId,
      beforeJson: {
        zaloOaAppId: before?.zaloOaAppId ?? null,
        hadZaloOaToken: !!before?.zaloOaToken,
      },
      afterJson: {
        zaloOaAppId: zaloOaAppId || null,
        hadZaloOaToken: zaloOaToken ? true : !!before?.zaloOaToken,
        tokenChanged: Boolean(zaloOaToken),
      },
      metadataJson: { source: 'settings_channels_api' },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update channels error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
