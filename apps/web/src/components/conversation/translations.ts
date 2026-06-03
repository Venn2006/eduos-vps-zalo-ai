import { ConversationIntent, Severity } from '@eduos/shared/src/lib/conversationIntelligence';

export const intentTranslations: Record<ConversationIntent, string> = {
  NEW_LEAD: 'Lead mới',
  PRICE_QUESTION: 'Hỏi học phí',
  TRIAL_BOOKING_REQUEST: 'Muốn học thử',
  CLASS_SCHEDULE_QUESTION: 'Hỏi lịch học',
  ABSENCE_REQUEST: 'Xin nghỉ học',
  HOMEWORK_SUBMISSION: 'Nộp bài tập',
  TUITION_QUESTION: 'Hỏi học phí / thanh toán',
  TUITION_REMINDER_REPLY: 'Phản hồi nhắc phí',
  PARENT_COMPLAINT: 'Phụ huynh phàn nàn',
  TEACHER_MESSAGE: 'Tin từ giáo viên',
  GENERAL_SUPPORT: 'Cần hỗ trợ',
  UNKNOWN: 'Chưa phân loại'
};

export const severityTranslations: Record<Severity, string> = {
  LOW: 'Bình thường',
  MEDIUM: 'Cần theo dõi',
  HIGH: 'Cần xử lý sớm',
  CRITICAL: 'Khẩn cấp'
};

export const getSeverityBadgeVariant = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL': return 'destructive';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW':
    default: return 'secondary';
  }
};
