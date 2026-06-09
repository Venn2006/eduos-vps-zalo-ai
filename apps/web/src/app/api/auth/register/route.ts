import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getJwtSecret, SESSION_COOKIE_NAME } from '@/lib/session';
import { enforceSameOrigin, rateLimit } from '@/lib/request-security';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterPayload = {
  centerName?: unknown;
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
};

function buildTenantSlug(centerName: string) {
  const slug = centerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'center';
}

export async function POST(req: Request) {
  try {
    const originGuard = enforceSameOrigin(req);
    if (originGuard) return originGuard;

    const ipLimit = await rateLimit(req, 'auth-register-ip', { limit: 10, windowMs: 60 * 60 * 1000 });
    if (ipLimit) return ipLimit;

    const body = (await req.json()) as RegisterPayload;
    const { centerName, fullName, email, password } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedCenterName = typeof centerName === 'string' ? centerName.trim() : '';
    const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const passwordValue = typeof password === 'string' ? password : '';

    if (!trimmedCenterName || !trimmedFullName || !normalizedEmail || !passwordValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (trimmedCenterName.length > 120 || trimmedFullName.length > 120 || normalizedEmail.length > 254) {
      return NextResponse.json({ error: 'Registration payload is too large' }, { status: 413 });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (passwordValue.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const emailLimit = await rateLimit(req, 'auth-register-email', {
      identity: normalizedEmail,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (emailLimit) return emailLimit;

    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(passwordValue, 10);

    // 3. Create Tenant and User
    // Calculate 7 days trial
    const trialStartsAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    const baseSlug = buildTenantSlug(trimmedCenterName);
    const existingTenant = await prisma.tenant.findUnique({ where: { slug: baseSlug } });
    const tenantSlug = existingTenant ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    // Using transaction to ensure both or neither are created
    const result = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: trimmedCenterName,
          slug: tenantSlug,
          subscriptionStatus: 'TRIAL',
          trialStartsAt,
          trialEndsAt,
        }
      });

      // Create User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: trimmedFullName,
          passwordHash: hashedPassword,
        }
      });

      // Link User to Tenant as OWNER
      const tenantMember = await tx.tenantMember.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });

      return { tenant, user, tenantMember };
    });

    // 4. Create Session
    const token = await new SignJWT({
      userId: result.user.id,
      email: result.user.email,
      role: 'OWNER',
      tenantId: result.tenant.id,
      activeTenantId: result.tenant.id,
      subscriptionStatus: result.tenant.subscriptionStatus,
      trialEndsAt: result.tenant.trialEndsAt?.toISOString()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getJwtSecret());

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    await createAuditLog(prisma, {
      tenantId: result.tenant.id,
      actorId: result.user.id,
      action: 'TENANT_REGISTERED',
      entityType: 'Tenant',
      entityId: result.tenant.id,
      afterJson: {
        tenantName: result.tenant.name,
        subscriptionStatus: result.tenant.subscriptionStatus,
        ownerEmail: result.user.email,
        ownerName: trimmedFullName,
      },
      metadataJson: { source: 'auth_register_api' },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
