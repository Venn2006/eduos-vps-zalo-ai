import { 
  ALLOWED_SANDBOX_STATUSES, 
  ALLOWED_SANDBOX_EVENTS, 
  sanitizeMetadata, 
  isValidSandboxTransition, 
  isForbiddenStatus 
} from '../lib/persistedSandboxOutboxPolicy';

describe('Persisted Sandbox Outbox Policy', () => {
  it('should accept valid sandbox statuses', () => {
    expect(ALLOWED_SANDBOX_STATUSES).toContain('MOCK_READY');
    expect(ALLOWED_SANDBOX_STATUSES).toContain('MOCK_SENT');
  });

  it('should identify forbidden statuses', () => {
    expect(isForbiddenStatus('MESSAGE_SENT')).toBe(true);
    expect(isForbiddenStatus('SENT')).toBe(true);
    expect(isForbiddenStatus('QUEUED_FOR_SEND')).toBe(true);
    expect(isForbiddenStatus('MOCK_READY')).toBe(false);
  });

  it('should correctly allow state transitions', () => {
    expect(isValidSandboxTransition('MOCK_READY', 'MOCK_QUEUED')).toBe(true);
    expect(isValidSandboxTransition('MOCK_QUEUED', 'MOCK_SENDING')).toBe(true);
    expect(isValidSandboxTransition('MOCK_SENDING', 'MOCK_SENT')).toBe(true);
    expect(isValidSandboxTransition('MOCK_SENDING', 'MOCK_FAILED')).toBe(true);
  });

  it('should reject invalid state transitions', () => {
    expect(isValidSandboxTransition('MOCK_SENT', 'MOCK_FAILED')).toBe(false); // cannot transition from SENT
    expect(isValidSandboxTransition('MOCK_READY', 'MOCK_SENT')).toBe(false);
    expect(isValidSandboxTransition('MOCK_FAILED', 'MOCK_QUEUED')).toBe(false);
  });

  it('should sanitize metadata removing passwords and tokens', () => {
    const raw = {
      user: 'admin',
      password: 'supersecret',
      api_key: 'sk-1234',
      token: 'abcd',
      nested: {
        otp: '123456',
        safeData: 'hello'
      }
    };
    const sanitized = sanitizeMetadata(raw);
    
    expect(sanitized.user).toBe('admin');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.api_key).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.nested.otp).toBe('[REDACTED]');
    expect(sanitized.nested.safeData).toBe('hello');
  });
});
