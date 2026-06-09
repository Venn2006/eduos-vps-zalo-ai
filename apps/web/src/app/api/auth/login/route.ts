import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@eduos/db';
import bcrypt from 'bcryptjs';
import { getJwtSecret, SESSION_COOKIE_NAME } from '@/lib/session';
import { enforceSameOrigin, rateLimit } from '@/lib/request-security';

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const originGuard = enforceSameOrigin(request);
    if (originGuard) return originGuard;

    const ipLimit = await rateLimit(request, 'auth-login-ip', { limit: 20, windowMs: 15 * 60 * 1000 });
    if (ipLimit) return ipLimit;

    const { email, password } = (await request.json()) as LoginPayload;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const passwordValue = typeof password === 'string' ? password : '';

    const emailLimit = await rateLimit(request, 'auth-login-email', {
      identity: normalizedEmail,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (emailLimit) return emailLimit;

    if (!normalizedEmail || !passwordValue) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        tenantMembers: {
          where: { status: 'ACTIVE' },
          include: { tenant: true },
          take: 1,
        },
      },
    });

    if (!user || !(await bcrypt.compare(passwordValue, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const membership = user.tenantMembers[0];
    if (!membership) {
      return NextResponse.json({ error: 'No active tenant membership' }, { status: 403 });
    }

    const { tenant } = membership;

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: membership.role,
      activeTenantId: tenant.id,
      trialEndsAt: tenant.trialEndsAt?.toISOString(),
      subscriptionStatus: tenant.subscriptionStatus
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getJwtSecret());

    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
