export const SESSION_COOKIE_NAME = 'session_token';

const DEV_JWT_SECRET = 'dev_only_change_me_jwt_secret';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }

    return new TextEncoder().encode(DEV_JWT_SECRET);
  }

  return new TextEncoder().encode(secret);
}
