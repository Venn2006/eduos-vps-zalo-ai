import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

export async function DELETE(req: Request) {
  try {
    const guard = await protectMutation(req, 'ai-knowledge-delete', { limit: 30, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const id = decodeURIComponent(new URL(req.url).pathname.split('/').pop() || '');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const before = await prisma.aiKnowledgeBase.findFirst({
      where: { id, tenantId },
      select: { id: true, category: true, title: true },
    });
    if (!before) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.aiKnowledgeBase.delete({
      where: { id }
    });

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'AI_KNOWLEDGE_BASE_DELETED',
      entityType: 'AiKnowledgeBase',
      entityId: id,
      beforeJson: before,
      metadataJson: { source: 'ai_knowledge_api' },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete AI KB error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
