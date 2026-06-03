export type GuardrailStatus = "SAFE" | "NEEDS_REVIEW" | "BLOCKED";
export type GuardrailSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type GuardrailIssueType =
  | "FORBIDDEN_KEYWORD"
  | "UNREALISTIC_GUARANTEE"
  | "RUDE_OR_TOO_SHORT"
  | "MISSING_GREETING"
  | "MISSING_CALL_TO_ACTION"
  | "TUITION_INFO_IN_GROUP_CHAT"
  | "PRIVATE_STUDENT_INFO_IN_GROUP_CHAT"
  | "POSSIBLE_WRONG_PRICE"
  | "POSSIBLE_WRONG_SCHEDULE"
  | "SECRET_OR_TOKEN_EXPOSED"
  | "PHONE_OR_OTP_EXPOSED"
  | "EMPTY_MESSAGE"
  | "UNKNOWN_RISK";

export interface GuardrailIssue {
  type: GuardrailIssueType;
  severity: GuardrailSeverity;
  description: string;
}

export interface GuardrailCheckOptions {
  message: string;
  channel: "ZALO" | "FANPAGE" | "SMS" | "EMAIL" | "INTERNAL";
  audience: "LEAD" | "PARENT" | "STUDENT" | "TEACHER" | "CLASS_GROUP" | "INTERNAL_ADMIN";
  staffRole: "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";
  context?: {
    studentName?: string;
    className?: string;
    courseName?: string;
    expectedPrice?: number;
    expectedSchedule?: string;
    isGroupChat?: boolean;
    containsTuitionContext?: boolean;
    containsStudentPrivateInfo?: boolean;
  };
  forbiddenKeywords?: string[];
}

export interface GuardrailCheckResult {
  status: GuardrailStatus;
  severity: GuardrailSeverity;
  issues: GuardrailIssue[];
  safeSummary: string;
  suggestedRewrite?: string;
  canCopy: boolean;
  canSendAfterApproval: boolean;
  shouldRequireManagerReview: boolean;
}

const PHONE_REGEX = /(?:(?:\+|00)84|0)\s*?[3|5|7|8|9](?:\s*?\d){8}\b/g;
const SECRET_REGEX = /(?:mật\s*khẩu|password|pass|otp|token|api\s*key).{0,30}?(?:là|is|:|=)\s*([a-zA-Z0-9!@#$%^&*]+)/gi;

import { createSafeSummary } from './conversationIntelligence';

export function checkMessageQuality(options: GuardrailCheckOptions): GuardrailCheckResult {
  const { message, channel, audience, context, forbiddenKeywords = [] } = options;
  const issues: GuardrailIssue[] = [];
  let status: GuardrailStatus = "SAFE";
  let maxSeverity: GuardrailSeverity | null = null;
  let suggestedRewrite: string | undefined = undefined;

  const text = message.trim();
  const lowerText = text.toLowerCase();

  const addIssue = (type: GuardrailIssueType, severity: GuardrailSeverity, description: string) => {
    issues.push({ type, severity, description });
    if (status === "SAFE") {
      status = severity === "CRITICAL" ? "BLOCKED" : "NEEDS_REVIEW";
    } else if (status === "NEEDS_REVIEW" && severity === "CRITICAL") {
      status = "BLOCKED";
    }

    if (!maxSeverity) {
      maxSeverity = severity;
    } else {
      const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      if (severityOrder[severity] > severityOrder[maxSeverity]) {
        maxSeverity = severity;
      }
    }
  };

  if (!text) {
    addIssue("EMPTY_MESSAGE", "CRITICAL", "Tin nhắn trống.");
    return finalizeResult(status, maxSeverity || "LOW", issues, text, suggestedRewrite);
  }

  // Check forbidden keywords
  for (const keyword of forbiddenKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      addIssue("FORBIDDEN_KEYWORD", "CRITICAL", `Chứa từ cấm: "${keyword}"`);
    }
  }

  // Check unrealistic guarantees
  const guarantees = ["đảm bảo đậu 100%", "cam kết chắc chắn đậu", "bao đậu"];
  for (const g of guarantees) {
    if (lowerText.includes(g)) {
      addIssue("UNREALISTIC_GUARANTEE", "CRITICAL", "Cam kết không thực tế (VD: bao đậu, đảm bảo 100%).");
      if (!suggestedRewrite) {
        suggestedRewrite = "Trung tâm cam kết đồng hành theo lộ trình rõ ràng, theo dõi tiến độ định kỳ và hỗ trợ học viên đạt mục tiêu phù hợp.";
      }
    }
  }

  // Check rude or too short
  const rudePhrases = ["không học thì chịu", "tự tìm hiểu đi"];
  for (const phrase of rudePhrases) {
    if (lowerText.includes(phrase)) {
      addIssue("RUDE_OR_TOO_SHORT", "HIGH", "Câu văn thiếu lịch sự hoặc không phù hợp.");
      if (!suggestedRewrite) {
        suggestedRewrite = "Dạ, để em hỗ trợ thêm thông tin chi tiết cho mình nhé ạ.";
      }
    }
  }

  // Check missing greeting
  if (!lowerText.includes("chào") && !lowerText.includes("dạ")) {
    addIssue("MISSING_GREETING", "MEDIUM", "Thiếu lời chào hoặc từ ngữ lịch sự (VD: 'Dạ', 'Chào').");
    if (!suggestedRewrite && maxSeverity !== "CRITICAL" && maxSeverity !== "HIGH") {
      suggestedRewrite = `Dạ em chào anh/chị ạ. ${text}`;
    }
  }

  // Check missing CTA
  if (!text.includes("?") && !lowerText.includes("nhé ạ") && !lowerText.includes("giúp em")) {
    addIssue("MISSING_CALL_TO_ACTION", "LOW", "Thiếu lời kêu gọi hành động (Call to Action) để giữ tương tác.");
    if (!suggestedRewrite && maxSeverity !== "CRITICAL" && maxSeverity !== "HIGH") {
      suggestedRewrite = `${text}\nAnh/chị cho em xin khung giờ thuận tiện để em tư vấn kỹ hơn nhé ạ.`;
    }
  }

  // Check privacy risks in group chat
  const isGroup = audience === "CLASS_GROUP" || context?.isGroupChat;
  if (isGroup) {
    const tuitionKeywords = ["học phí", "đóng tiền", "thanh toán", "chuyển khoản"];
    if (tuitionKeywords.some(k => lowerText.includes(k)) || context?.containsTuitionContext) {
      addIssue("TUITION_INFO_IN_GROUP_CHAT", "CRITICAL", "Không được nhắc học phí/thanh toán trong group lớp chung.");
      if (!suggestedRewrite) {
         suggestedRewrite = "Dạ phụ huynh vui lòng check inbox riêng để admin gửi thông tin chi tiết nhé ạ.";
      }
    }

    if (context?.containsStudentPrivateInfo) {
      addIssue("PRIVATE_STUDENT_INFO_IN_GROUP_CHAT", "CRITICAL", "Không gửi thông tin cá nhân của từng bé lên group chung.");
    }
  }

  // Check secrets/tokens exposure
  let needsPrivacyMask = false;
  if (text.match(SECRET_REGEX) || ["mật khẩu", "otp", "token", "api key"].some(k => lowerText.includes(k))) {
    addIssue("SECRET_OR_TOKEN_EXPOSED", "CRITICAL", "Lộ thông tin bảo mật (Mật khẩu, OTP, Token).");
    needsPrivacyMask = true;
  }

  // Check phone exposure
  if (text.match(PHONE_REGEX)) {
    addIssue("PHONE_OR_OTP_EXPOSED", "CRITICAL", "Để lộ số điện thoại hoặc mã OTP trong nội dung chat (có thể vi phạm chính sách FB/Zalo nếu gửi tự động).");
    needsPrivacyMask = true;
  }
  
  if (needsPrivacyMask) {
    // If there's already a suggested rewrite from other issues, mask that. Otherwise mask original text.
    // Also use the more robust regex from earlier for tests.
    let base = suggestedRewrite || text;
    base = base.replace(PHONE_REGEX, "[SĐT BẢO MẬT]");
    base = base.replace(SECRET_REGEX, "[BẢO MẬT]");
    suggestedRewrite = base;
  }

  return finalizeResult(status, maxSeverity || "LOW", issues, text, suggestedRewrite);
}

function finalizeResult(
  status: GuardrailStatus, 
  maxSeverity: GuardrailSeverity, 
  issues: GuardrailIssue[], 
  text: string, 
  suggestedRewrite?: string
): GuardrailCheckResult {
  const safeSummary = issues.length > 0 
    ? `Có ${issues.length} vấn đề cần lưu ý.` 
    : "Tin nhắn an toàn, thân thiện.";

  return {
    status,
    severity: maxSeverity,
    issues,
    safeSummary,
    suggestedRewrite,
    canCopy: status !== "BLOCKED",
    canSendAfterApproval: status === "NEEDS_REVIEW",
    shouldRequireManagerReview: status === "BLOCKED" || maxSeverity === "CRITICAL"
  };
}
