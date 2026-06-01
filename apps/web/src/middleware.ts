import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_for_development");

// Routing logic is handled by server component RBAC

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/webhooks') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    console.log("[Middleware] Missing session_token cookie, redirecting to /login");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    
    // Attach decoded session to headers so Server Components can read it without decoding again if needed
    // (Or Server Components can just read the cookie and decode)
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-tenant-id', payload.activeTenantId as string);
    response.headers.set('x-user-role', role);
    return response;
  } catch (err) {
    console.log("[Middleware] JWT verify failed:", err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
