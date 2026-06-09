import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret, SESSION_COOKIE_NAME } from './session';

export type AppRole = 'OWNER' | 'ADMIN' | 'SALE' | 'TEACHER' | 'ACCOUNTANT';

export type AppSession = {
  userId: string;
  email: string;
  activeTenantId: string;
  role: AppRole | string;
};

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AppSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentTenantOrThrow() {
  const session = await getSession();
  if (!session || !session.activeTenantId) {
    throw new Error('Unauthorized');
  }
  return session.activeTenantId;
}

export async function requireAuthenticated() {
  const session = await getSession();
  if (!session || !session.activeTenantId) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await requireAuthenticated();

  if (!allowedRoles.includes(session.role as AppRole)) {
    throw new Error('Forbidden');
  }

  return {
    ...session,
    role: session.role as AppRole,
  };
}
