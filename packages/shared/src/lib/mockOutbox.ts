import { redactSensitiveInfo } from './timelineBuilder';

export type MockOutboxStatus =
  | 'MOCK_READY'
  | 'MOCK_QUEUED'
  | 'MOCK_SENDING'
  | 'MOCK_SENT'
  | 'MOCK_FAILED'
  | 'MOCK_CANCELLED';

export interface MockOutboxItem {
  id: string;
  tenantId: string;
  channel: 'ZALO' | 'FACEBOOK';
  draftId: string;
  recipientId: string;
  content: string;
  status: MockOutboxStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export type MockOutboxTransition =
  | 'QUEUE'
  | 'START_SEND'
  | 'COMPLETE_SEND'
  | 'FAIL_SEND'
  | 'CANCEL';

export interface MockDeliveryResult {
  success: boolean;
  item?: MockOutboxItem;
  error?: string;
}

export function generateIdempotencyKey(tenantId: string, channel: string, draftId: string, recipientId: string): string {
  return `mock_outbox_${tenantId}_${channel}_${draftId}_${recipientId}`;
}

export function validateMockOutboxItem(tenantId: string, channel: string, draftId: string, recipientId: string, content: string): boolean {
  if (!tenantId || !channel || !draftId || !recipientId || !content) return false;
  return true;
}

export function getVietnameseMockStatusLabel(status: MockOutboxStatus): string {
  switch (status) {
    case 'MOCK_READY': return 'Sẵn sàng giả lập';
    case 'MOCK_QUEUED': return 'Đã xếp hàng giả lập';
    case 'MOCK_SENDING': return 'Đang gửi giả lập';
    case 'MOCK_SENT': return 'Gửi giả lập thành công';
    case 'MOCK_FAILED': return 'Gửi giả lập lỗi';
    case 'MOCK_CANCELLED': return 'Đã hủy giả lập';
    default: return 'Không xác định';
  }
}

export function transitionMockOutbox(item: MockOutboxItem, action: MockOutboxTransition): MockDeliveryResult {
  // Prevent duplicate/invalid transitions
  const updatedItem = { ...item, updatedAt: new Date().toISOString() };

  if (item.status === 'MOCK_SENT' || item.status === 'MOCK_FAILED' || item.status === 'MOCK_CANCELLED') {
    return { success: false, error: 'Cannot transition from a terminal state.' };
  }

  switch (action) {
    case 'QUEUE':
      if (item.status !== 'MOCK_READY') return { success: false, error: 'Can only queue from READY state.' };
      updatedItem.status = 'MOCK_QUEUED';
      break;
    case 'START_SEND':
      if (item.status !== 'MOCK_QUEUED') return { success: false, error: 'Can only send from QUEUED state.' };
      updatedItem.status = 'MOCK_SENDING';
      break;
    case 'COMPLETE_SEND':
      if (item.status !== 'MOCK_SENDING') return { success: false, error: 'Can only complete from SENDING state.' };
      updatedItem.status = 'MOCK_SENT';
      break;
    case 'FAIL_SEND':
      if (item.status !== 'MOCK_SENDING') return { success: false, error: 'Can only fail from SENDING state.' };
      updatedItem.status = 'MOCK_FAILED';
      break;
    case 'CANCEL':
      if (item.status !== 'MOCK_QUEUED' && item.status !== 'MOCK_READY') {
        return { success: false, error: 'Can only cancel from READY or QUEUED state.' };
      }
      updatedItem.status = 'MOCK_CANCELLED';
      break;
    default:
      return { success: false, error: 'Invalid action.' };
  }

  return { success: true, item: updatedItem };
}

export function getSafeMockSummary(content: string): string {
  return redactSensitiveInfo(content);
}
