import { NextResponse } from 'next/server';

type RateLimitOptions = {
  identity?: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

type UpstashConfig = {
  url: string;
  token: string;
};

function getUpstashConfig(): UpstashConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return null;
  return { url, token };
}

function canUseMemoryRateLimitFallback() {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_IN_MEMORY_RATE_LIMITS === 'true';
}

function rateLimitStoreUnavailable() {
  return NextResponse.json(
    { error: 'Rate limit store unavailable' },
    { status: 503, headers: { 'Retry-After': '30' } }
  );
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'local';
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size < 500) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function enforceSameOrigin(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  if (!origin && process.env.NODE_ENV === 'production') {
    let refererOrigin: string | null = null;
    try {
      refererOrigin = referer ? new URL(referer).origin : null;
    } catch {
      refererOrigin = null;
    }

    if (refererOrigin !== expectedOrigin) {
      return NextResponse.json({ error: 'Missing request origin' }, { status: 403 });
    }
  }

  return null;
}

function rateLimitMemory(request: Request, scope: string, options: RateLimitOptions) {
  const now = Date.now();
  const identity = options.identity?.trim().toLowerCase() || getClientKey(request);
  const key = `${scope}:${identity}`;
  const bucket = buckets.get(key);

  pruneExpiredBuckets(now);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  bucket.count += 1;

  if (bucket.count > options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      }
    );
  }

  return null;
}

async function upstashCommand(config: UpstashConfig, command: string[]) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  return response.json() as Promise<{ result?: unknown }>;
}

async function rateLimitUpstash(request: Request, scope: string, options: RateLimitOptions, config: UpstashConfig) {
  const identity = options.identity?.trim().toLowerCase() || getClientKey(request);
  const key = `rl:${scope}:${identity}`;
  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));

  const increment = await upstashCommand(config, ['INCR', key]);
  const count = Number(increment.result || 0);

  if (count === 1) {
    await upstashCommand(config, ['EXPIRE', key, String(windowSeconds)]);
  }

  if (count <= options.limit) return null;

  let retryAfterSeconds = windowSeconds;
  try {
    const ttl = await upstashCommand(config, ['TTL', key]);
    const parsedTtl = Number(ttl.result);
    if (Number.isFinite(parsedTtl) && parsedTtl > 0) retryAfterSeconds = parsedTtl;
  } catch {
    retryAfterSeconds = windowSeconds;
  }

  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) },
    }
  );
}

export async function rateLimit(request: Request, scope: string, options: RateLimitOptions) {
  const config = getUpstashConfig();
  if (!config) {
    if (canUseMemoryRateLimitFallback()) return rateLimitMemory(request, scope, options);
    return rateLimitStoreUnavailable();
  }

  try {
    return await rateLimitUpstash(request, scope, options, config);
  } catch (error) {
    console.error('Shared rate limit store unavailable', error);
    if (canUseMemoryRateLimitFallback()) return rateLimitMemory(request, scope, options);
    return rateLimitStoreUnavailable();
  }
}

export async function protectMutation(request: Request, scope: string, options: RateLimitOptions) {
  const originGuard = enforceSameOrigin(request);
  if (originGuard) return originGuard;

  return rateLimit(request, scope, options);
}
