export type ConversationIntent = 
  | 'NEW_LEAD'
  | 'PRICE_QUESTION'
  | 'TRIAL_BOOKING_REQUEST'
  | 'CLASS_SCHEDULE_QUESTION'
  | 'ABSENCE_REQUEST'
  | 'HOMEWORK_SUBMISSION'
  | 'TUITION_QUESTION'
  | 'TUITION_REMINDER_REPLY'
  | 'PARENT_COMPLAINT'
  | 'TEACHER_MESSAGE'
  | 'GENERAL_SUPPORT'
  | 'UNKNOWN';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IntelligenceResult {
  intent: ConversationIntent;
  severity: Severity;
  safeSummary: string;
  suggestedNextAction: string;
  suggestedTags: string[];
  shouldCreateFollowUpTask: boolean;
  shouldCreateAiDraft: boolean;
}

/**
 * Strips phone numbers (Vietnamese format: 10 digits starting with 0 or +84) 
 * and explicit password/secret keywords from the text.
 */
export function createSafeSummary(text: string): string {
  if (!text) return "";
  
  // Mask 10/11 digit phones starting with 0, or starting with +84/84
  let safe = text.replace(/(?:\+?84|0)(?:[\s\.\-]*\d){9}/g, '[PHONE_REDACTED]');
  
  // Mask common secrets/passwords heuristically
  const secretPattern = /(:|là|is|=)?\s*\S+/gi;
  safe = safe.replace(/mật khẩu\s*(?:là|is|:|=)?\s*\S+/gi, 'mật khẩu [REDACTED]');
  safe = safe.replace(/\bpassword\b\s*(?:là|is|:|=)?\s*\S+/gi, 'password [REDACTED]');
  safe = safe.replace(/\bpass\b\s*(?:là|is|:|=)?\s*\S+/gi, 'pass [REDACTED]');
  safe = safe.replace(/\btoken\b\s*(?:là|is|:|=)?\s*\S+/gi, 'token [REDACTED]');
  safe = safe.replace(/api key\s*(?:là|is|:|=)?\s*\S+/gi, 'api key [REDACTED]');
  safe = safe.replace(/mã otp\s*(?:của bạn là|là|is|:|=)?\s*\S+/gi, 'mã OTP [REDACTED]');
  safe = safe.replace(/\botp\b\s*(?:là|is|:|=)?\s*\S+/gi, 'OTP [REDACTED]');
  
  return safe;
}

export function analyzeConversation(transcript: string, channel: 'FACEBOOK' | 'ZALO'): IntelligenceResult {
  const lowerText = transcript.toLowerCase();
  
  // Default values
  const result: IntelligenceResult = {
    intent: 'UNKNOWN',
    severity: 'LOW',
    safeSummary: '',
    suggestedNextAction: 'Cần nhân viên kiểm tra trực tiếp',
    suggestedTags: [],
    shouldCreateFollowUpTask: false,
    shouldCreateAiDraft: false
  };

  // 1. Complaint Detection
  if (lowerText.match(/(bạo lực|tệ|kém|thất vọng|bức xúc|lừa đảo|tẩy chay)/)) {
    result.intent = 'PARENT_COMPLAINT';
    result.severity = 'CRITICAL';
    result.suggestedNextAction = 'Báo cáo ngay cho Quản lý / Center Manager';
    result.suggestedTags = ['Phụ huynh cần tư vấn kỹ', 'Rủi ro'];
    result.shouldCreateFollowUpTask = true;
    result.shouldCreateAiDraft = true;
  }
  // 2. Lead / Pricing / Trial
  else if (lowerText.match(/(giá|học phí bao nhiêu|tiền học|chi phí)/)) {
    result.intent = 'PRICE_QUESTION';
    result.severity = 'MEDIUM';
    result.suggestedNextAction = 'Phản hồi bảng giá và ưu đãi hiện tại';
    result.suggestedTags = ['Hỏi học phí', 'Chưa phản hồi'];
    result.shouldCreateFollowUpTask = true;
    result.shouldCreateAiDraft = true;
  }
  else if (lowerText.match(/(học thử|đăng ký thử|cho bé thử)/)) {
    result.intent = 'TRIAL_BOOKING_REQUEST';
    result.severity = 'HIGH';
    result.suggestedNextAction = 'Xác nhận thông tin bé và xếp lớp học thử';
    result.suggestedTags = ['Muốn học thử', 'Lead nóng'];
    result.shouldCreateFollowUpTask = true;
    result.shouldCreateAiDraft = true;
  }
  else if (lowerText.match(/(tư vấn|lịch học|khai giảng|khoá học)/)) {
    result.intent = 'NEW_LEAD';
    result.severity = 'MEDIUM';
    result.suggestedNextAction = 'Gửi thông tin khoá học và lịch khai giảng';
    result.suggestedTags = ['Cần gọi lại'];
    result.shouldCreateFollowUpTask = true;
    result.shouldCreateAiDraft = true;
  }
  // 3. Academic
  else if (lowerText.match(/(nghỉ học|xin phép|bệnh|ốm)/)) {
    result.intent = 'ABSENCE_REQUEST';
    result.severity = 'LOW';
    result.suggestedNextAction = 'Ghi nhận báo nghỉ và sắp xếp học bù';
    result.suggestedTags = ['Hay nghỉ'];
    result.shouldCreateFollowUpTask = false;
    result.shouldCreateAiDraft = true;
  }
  else if (lowerText.match(/(bài tập|nop bai)/)) {
    result.intent = 'HOMEWORK_SUBMISSION';
    result.severity = 'LOW';
    result.suggestedNextAction = 'Giáo viên kiểm tra bài tập';
    result.suggestedTags = ['Có tiến bộ'];
    result.shouldCreateFollowUpTask = false;
    result.shouldCreateAiDraft = false;
  }
  
  // Create a safe summary
  // Take the last 150 characters roughly, or a specific summary sentence
  const rawSummary = `Nội dung: ${transcript.substring(0, 100)}...`;
  result.safeSummary = createSafeSummary(rawSummary);

  return result;
}
