import { NextResponse } from 'next/server';
import { createAuditLog, Prisma, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

export async function POST(req: Request) {
  try {
    const guard = await protectMutation(req, 'classes-create', { limit: 30, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const body = (await req.json()) as { classCode?: unknown; courseId?: unknown };
    const classCode = typeof body.classCode === 'string' ? body.classCode.trim() : '';
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';

    if (!classCode || !courseId) {
      return NextResponse.json({ error: 'Missing classCode or courseId' }, { status: 400 });
    }

    if (String(classCode).length > 50 || String(courseId).length > 120) {
      return NextResponse.json({ error: 'Class payload is too large' }, { status: 413 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, tenantId, deletedAt: null },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { tenantId_classCode: { tenantId, classCode } },
      select: { id: true },
    });

    if (existingClass) {
      return NextResponse.json({ error: 'Class code already exists' }, { status: 409 });
    }

    const newClass = await prisma.class.create({
      data: {
        tenantId,
        classCode,
        courseId,
        status: 'ACTIVE',
        // Optional placeholder values to satisfy schema constraints if needed
      },
      select: {
        id: true,
        classCode: true,
        status: true,
        courseId: true,
        teacher: { select: { name: true } },
        automationSetting: { select: { classReminderEnabled: true } },
        sessions: { select: { startTime: true, endTime: true, attendances: { select: { status: true } } } },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            student: { select: { id: true, name: true, phone: true, guardian: { select: { name: true, phone: true } } } },
          },
        },
      },
    });

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'CLASS_CREATED',
      entityType: 'Class',
      entityId: newClass.id,
      afterJson: { classCode: newClass.classCode, courseId: newClass.courseId, status: newClass.status },
      metadataJson: { source: 'classes_api' },
    });

    return NextResponse.json(newClass);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Class code already exists' }, { status: 409 });
    }
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
