export type AIAddonCategory = "STUDENT_CARE" | "ACADEMIC" | "SALES" | "MARKETING" | "MANAGEMENT";
export type AIAddonMode = 
  | "AUTO"
  | "AUTO_FOR_LOW_RISK"
  | "AUTO_WITH_DASHBOARD_REPORT"
  | "AUTO_SANDBOX"
  | "REVIEW_REQUIRED"
  | "REVIEW_REQUIRED_FOR_HIGH_RISK"
  | "TEACHER_APPROVAL_REQUIRED"
  | "DRAFT_ONLY"
  | "SCHEDULE_WITH_APPROVAL"
  | "READ_ONLY_INSIGHTS"
  | "ACTION_DRAFTS_WITH_APPROVAL"
  | "OFF";

export type AIAddonStatus = "PILOT_READY" | "SANDBOX_ONLY" | "COMING_SOON";

export interface AIAddon {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  priceVndMonthly?: number;
  isPremium?: boolean;
  category: AIAddonCategory;
  recommendedFor: string[];
  channels: string[];
  automationModes: AIAddonMode[];
  defaultMode: AIAddonMode;
  requiresApprovalFor: string[];
  safetyNotes: string;
  setupSteps: string[];
  demoStatus: AIAddonStatus;
  ctaLabel: string;
}

export const AI_ADDON_CATALOG: AIAddon[] = [
  {
    id: "AI_CLASS_REMINDER",
    name: "AI nhắc lịch học",
    shortDescription: "Tự động nhắc lịch học trước 1 tiếng cho phụ huynh và học viên.",
    fullDescription: "Bot nhắc lịch học cho lớp, giáo viên, học viên/phụ huynh. Giúp tăng tỷ lệ đi học chuyên cần và giảm thiểu sự phàn nàn do quên lịch.",
    priceVndMonthly: 200000,
    category: "STUDENT_CARE",
    recommendedFor: ["Trung tâm mới", "Trung tâm có nhiều lớp học", "Giáo vụ"],
    channels: ["Zalo Group", "Zalo Inbox", "Fanpage"],
    automationModes: ["AUTO", "REVIEW_REQUIRED", "OFF"],
    defaultMode: "REVIEW_REQUIRED",
    requiresApprovalFor: ["Lần đầu tiên chạy", "Lịch học có sự thay đổi đột xuất"],
    safetyNotes: "Mặc định AI sẽ cần duyệt (REVIEW_REQUIRED) trong giai đoạn Pilot để đảm bảo độ chính xác của thời khóa biểu.",
    setupSteps: ["Kết nối Zalo OA", "Khai báo thời khóa biểu", "Bật chế độ AI Nhắc lịch"],
    demoStatus: "SANDBOX_ONLY",
    ctaLabel: "Bật dùng thử (Vào Sandbox)"
  },
  {
    id: "AI_HOMEWORK_GRADING_REPORT",
    name: "AI bài tập, điểm danh & báo cáo phụ huynh",
    shortDescription: "Chấm nháp bài tập, tổng hợp điểm danh, tạo báo cáo phụ huynh.",
    fullDescription: "AI tự động chấm nháp bài tập về nhà dựa trên rubric, tổng hợp điểm danh từ lớp học, và phác thảo báo cáo tình hình học tập hàng tuần cho phụ huynh. Giáo viên chỉ cần duyệt và gửi.",
    priceVndMonthly: 300000,
    category: "ACADEMIC",
    recommendedFor: ["Giáo viên", "Trung tâm luyện thi", "Trung tâm ngoại ngữ"],
    channels: ["Internal Dashboard", "Zalo Inbox (Gửi báo cáo)"],
    automationModes: ["TEACHER_APPROVAL_REQUIRED", "OFF"],
    defaultMode: "TEACHER_APPROVAL_REQUIRED",
    requiresApprovalFor: ["Kết quả chấm bài", "Báo cáo phụ huynh cuối cùng"],
    safetyNotes: "Tuyệt đối KHÔNG tự động chốt điểm và báo cáo cho phụ huynh mà không qua phê duyệt của giáo viên.",
    setupSteps: ["Tải lên rubric chấm điểm", "Kết nối danh sách lớp", "Cấu hình lịch gửi báo cáo"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cấu hình luồng duyệt"
  },
  {
    id: "AI_RENEWAL_CARE",
    name: "AI chăm sóc tái phí",
    shortDescription: "Tự động nhắc tái phí khéo léo, follow-up tối đa 3 lần.",
    fullDescription: "AI tự động nhắc tái phí khéo léo cho học viên sắp hết khóa học, follow-up tối đa 3 lần, nếu không thành công sẽ báo dashboard để nhân viên Sale tiếp quản.",
    priceVndMonthly: 250000,
    category: "SALES",
    recommendedFor: ["Sales", "Kế toán", "Trung tâm quy mô vừa và lớn"],
    channels: ["Zalo Inbox", "Fanpage"],
    automationModes: ["AUTO_WITH_DASHBOARD_REPORT", "REVIEW_REQUIRED", "OFF"],
    defaultMode: "REVIEW_REQUIRED",
    requiresApprovalFor: ["Tin nhắn chứa thông tin giảm giá/ưu đãi", "Chuyển giao cho Sale nếu thất bại"],
    safetyNotes: "Luôn dừng lại và chuyển cho nhân viên thật nếu khách hàng có câu hỏi phức tạp hoặc sau 3 lần không phản hồi.",
    setupSteps: ["Nhập mẫu câu nhắc phí", "Cài đặt điều kiện thời gian (Ví dụ: trước 14 ngày)", "Kết nối Zalo/Fanpage"],
    demoStatus: "SANDBOX_ONLY",
    ctaLabel: "Bản demo (Sandbox)"
  },
  {
    id: "AI_ADMISSION_CONSULTANT",
    name: "AI tư vấn tuyển sinh",
    shortDescription: "Tư vấn Fanpage/Zalo, hẹn học thử, gửi lead về CEO/SALE.",
    fullDescription: "AI tư vấn tuyển sinh sẽ tự động trả lời tin nhắn Fanpage, Zalo OA và Zalo cá nhân, giải đáp các câu hỏi cơ bản, xin thông tin và lên lịch học thử. Thông tin lead sẽ được chuyển trực tiếp về CRM.",
    priceVndMonthly: 500000,
    category: "SALES",
    recommendedFor: ["Marketing", "Sales", "Trung tâm thiếu nhân sự CSKH"],
    channels: ["Fanpage", "Zalo OA", "Zalo cá nhân"],
    automationModes: ["AUTO_FOR_LOW_RISK", "REVIEW_REQUIRED_FOR_HIGH_RISK", "OFF"],
    defaultMode: "REVIEW_REQUIRED_FOR_HIGH_RISK",
    requiresApprovalFor: ["Tư vấn chốt deal", "Giảm giá đặc biệt", "Khách hàng phàn nàn"],
    safetyNotes: "Những câu hỏi rủi ro cao (ví dụ: bóc phốt, phàn nàn) sẽ lập tức yêu cầu Human Handoff (Chuyển cho nhân viên thật).",
    setupSteps: ["Đào tạo AI bằng tài liệu trung tâm", "Cài đặt câu hỏi thường gặp", "Bật tính năng cho từng Fanpage/Zalo"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cấu hình AI CSKH"
  },
  {
    id: "AI_CONTENT_POSTING",
    name: "AI đăng bài kéo lead",
    shortDescription: "Tạo lịch đăng bài Fanpage/Zalo trong 1 tháng để kéo lead.",
    fullDescription: "AI phân tích tệp khách hàng tiềm năng, từ đó tạo ra lịch đăng bài (Content Calendar) cho 30 ngày bao gồm bài viết, kịch bản video để thu hút lead. Cho phép lên lịch đăng tự động sau khi duyệt.",
    priceVndMonthly: 500000,
    category: "MARKETING",
    recommendedFor: ["Marketing", "CEO"],
    channels: ["Fanpage", "Zalo OA"],
    automationModes: ["DRAFT_ONLY", "SCHEDULE_WITH_APPROVAL", "OFF"],
    defaultMode: "DRAFT_ONLY",
    requiresApprovalFor: ["Mọi nội dung trước khi xuất bản"],
    safetyNotes: "Tuyệt đối không tự động đăng bài khi chưa có sự xác nhận của quản trị viên (DRAFT_ONLY).",
    setupSteps: ["Nhập thông tin chiến dịch", "Tạo lịch Content", "Duyệt nội dung"],
    demoStatus: "COMING_SOON",
    ctaLabel: "Sắp có"
  },
  {
    id: "AI_CEO_COMMAND_CENTER",
    name: "AI trợ lý CEO",
    shortDescription: "Trợ lý hỏi đáp tình hình tuyển sinh, tài chính, lớp học.",
    fullDescription: "Trợ lý CEO thông minh giúp trả lời các câu hỏi phức tạp về tình hình trung tâm bằng ngôn ngữ tự nhiên, phân tích điểm yếu trong tuyển sinh, tài chính và tự động đề xuất hành động.",
    isPremium: true,
    category: "MANAGEMENT",
    recommendedFor: ["CEO", "Chủ trung tâm", "Giám đốc vận hành"],
    channels: ["Internal Dashboard", "Mobile App (Sắp có)"],
    automationModes: ["READ_ONLY_INSIGHTS", "ACTION_DRAFTS_WITH_APPROVAL", "OFF"],
    defaultMode: "READ_ONLY_INSIGHTS",
    requiresApprovalFor: ["Thay đổi chiến lược", "Ra lệnh cho các hệ thống khác"],
    safetyNotes: "Chỉ hoạt động dưới quyền hạn (RBAC) của Giám đốc (OWNER/ADMIN).",
    setupSteps: ["Xác thực quyền", "Khởi tạo bảng điều khiển"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Dùng ngay"
  }
];

export function getAIAddonsByCategory(): Record<AIAddonCategory, AIAddon[]> {
  const grouped: Record<string, AIAddon[]> = {};
  for (const addon of AI_ADDON_CATALOG) {
    if (!grouped[addon.category]) {
      grouped[addon.category] = [];
    }
    grouped[addon.category].push(addon);
  }
  return grouped as Record<AIAddonCategory, AIAddon[]>;
}
