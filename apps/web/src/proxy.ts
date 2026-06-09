import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret, SESSION_COOKIE_NAME } from './lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/health/supabase-keepalive' ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const role = payload.role as string;
    const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt as string) : null;
    const subscriptionStatus = payload.subscriptionStatus as string;

    const isTrialExpired = trialEndsAt && trialEndsAt < new Date() && subscriptionStatus === 'TRIAL';
    if (isTrialExpired && pathname !== '/billing' && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/billing', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-tenant-id', payload.activeTenantId as string);
    response.headers.set('x-user-role', role);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
