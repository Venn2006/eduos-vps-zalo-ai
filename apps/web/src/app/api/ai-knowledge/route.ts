import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

export async function POST(req: Request) {
  try {
    const guard = await protectMutation(req, 'ai-knowledge-create', { limit: 30, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const body = await req.json();
    const { category, title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    if (String(title).length > 160 || String(content).length > 12000) {
      return NextResponse.json({ error: 'Knowledge base entry is too large' }, { status: 413 });
    }

    const newKb = await prisma.aiKnowledgeBase.create({
      data: {
        tenantId,
        category: category || 'FAQ',
        title,
        content
      }
    });

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'AI_KNOWLEDGE_BASE_CREATED',
      entityType: 'AiKnowledgeBase',
      entityId: newKb.id,
      afterJson: { category: newKb.category, title: newKb.title },
      metadataJson: { source: 'ai_knowledge_api' },
    });

    return NextResponse.json(newKb);

  } catch (error: unknown) {
    console.error('Create AI KB error:', error);
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
