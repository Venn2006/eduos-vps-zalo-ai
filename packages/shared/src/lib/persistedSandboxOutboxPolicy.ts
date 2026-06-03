export const ALLOWED_SANDBOX_STATUSES = [
  'MOCK_READY',
  'MOCK_QUEUED',
  'MOCK_SENDING',
  'MOCK_SENT',
  'MOCK_FAILED',
  'MOCK_CANCELLED'
] as const;

export type SandboxStatus = typeof ALLOWED_SANDBOX_STATUSES[number];

export const ALLOWED_SANDBOX_EVENTS = [
  'SANDBOX_OUTBOX_ITEM_CREATED',
  'SANDBOX_OUTBOX_QUEUED',
  'SANDBOX_OUTBOX_SENDING_SIMULATED',
  'SANDBOX_OUTBOX_SENT_SIMULATED',
  'SANDBOX_OUTBOX_FAILED_SIMULATED',
  'SANDBOX_OUTBOX_CANCELLED',
  'SANDBOX_PREVIEW_ONLY'
] as const;

export type SandboxEventType = typeof ALLOWED_SANDBOX_EVENTS[number];

export function sanitizeMetadata(metadata: any): any {
  if (!metadata) return null;
  const clone = JSON.parse(JSON.stringify(metadata));
  const forbiddenKeys = ['password', 'token', 'secret', 'phone', 'api_key', 'apikey', 'otp'];
  
  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (forbiddenKeys.some(fk => key.toLowerCase().includes(fk))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  sanitize(clone);
  return clone;
}

export function isValidSandboxTransition(current: SandboxStatus, next: SandboxStatus): boolean {
  if (current === 'MOCK_READY' && next === 'MOCK_QUEUED') return true;
  if (current === 'MOCK_QUEUED' && next === 'MOCK_SENDING') return true;
  if (current === 'MOCK_SENDING' && next === 'MOCK_SENT') return true;
  if (current === 'MOCK_SENDING' && next === 'MOCK_FAILED') return true;
  if (current === 'MOCK_QUEUED' && next === 'MOCK_CANCELLED') return true;
  if (current === 'MOCK_READY' && next === 'MOCK_CANCELLED') return true;
  return false;
}

export function isForbiddenStatus(status: string): boolean {
  return ['MESSAGE_SENT', 'SENT', 'QUEUED_FOR_SEND', 'DELIVERED'].includes(status) || !ALLOWED_SANDBOX_STATUSES.includes(status as any);
}
