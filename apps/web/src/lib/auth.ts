import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_for_development");

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: string;
      email: string;
      activeTenantId: string;
      role: string;
    };
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
