import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

const ALLOWED_ROLES = new Set(['ADMIN', 'SALE', 'TEACHER', 'ACCOUNTANT']);

export async function POST(req: Request) {
  try {
    const guard = await protectMutation(req, 'settings-staff', { limit: 20, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const body = await req.json();
    const { name, email, password, role } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedName || !normalizedEmail || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction to create User and TenantMember
    const member = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: trimmedName,
          passwordHash: hashedPassword,
        }
      });

      const tenantMember = await tx.tenantMember.create({
        data: {
          tenantId,
          userId: user.id,
          role,
          status: 'ACTIVE'
        },
        include: { user: { select: { id: true, email: true, name: true } } }
      });

      return tenantMember;
    });

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'STAFF_MEMBER_CREATED',
      entityType: 'TenantMember',
      entityId: member.id,
      afterJson: {
        userId: member.userId,
        email: normalizedEmail,
        name: trimmedName,
        role,
        status: member.status,
      },
      metadataJson: { source: 'settings_staff_api' },
    });

    return NextResponse.json(member);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
