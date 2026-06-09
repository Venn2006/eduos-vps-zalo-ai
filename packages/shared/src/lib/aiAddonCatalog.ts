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
  isInstalled?: boolean; // Toggle state for the UI
  includedInPlan?: 'PRO' | 'ENTERPRISE'; // Indicates which plan includes this addon for free
}

export const AI_ADDON_CATALOG: AIAddon[] = [
  {
    id: "AI_CLASS_REMINDER",
    name: "AI Nhắc lịch học",
    shortDescription: "Tự động nhắc lịch học trước 1 tiếng, đính kèm phòng học.",
    fullDescription: "Gửi tin nhắn Zalo/Fanpage nhắc lịch học cho học viên/phụ huynh trước 1 tiếng. Hỗ trợ kèm link học online hoặc phòng học thực tế để giảm tải câu hỏi lặp lại cho Lễ tân.",
    priceVndMonthly: 150000,
    category: "STUDENT_CARE",
    recommendedFor: ["Trung tâm mới", "Lễ tân"],
    channels: ["Zalo Group", "Zalo Inbox", "Fanpage"],
    automationModes: ["REVIEW_REQUIRED", "OFF"],
    defaultMode: "REVIEW_REQUIRED",
    requiresApprovalFor: ["Lịch học có sự thay đổi đột xuất"],
    safetyNotes: "Mặc định AI tự động nhắc khi thời khóa biểu đã được chốt.",
    setupSteps: ["Kết nối Zalo OA", "Khai báo thời khóa biểu"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: true,
    includedInPlan: 'PRO'
  },
  {
    id: "AI_ZALO_ATTENDANCE",
    name: "AI Điểm danh nhóm Zalo",
    shortDescription: "Nằm vùng trong nhóm, tự động điểm danh ra báo cáo.",
    fullDescription: "AI đóng vai trò như một thư ký nằm vùng trong nhóm Zalo lớp học. Ghi nhận chuyên cần và tự động xuất báo cáo điểm danh cuối giờ lên phần mềm, không cần giáo viên thao tác thủ công.",
    priceVndMonthly: 200000,
    category: "ACADEMIC",
    recommendedFor: ["Giáo vụ", "Giáo viên"],
    channels: ["Zalo Group"],
    automationModes: ["AUTO_WITH_DASHBOARD_REPORT", "OFF"],
    defaultMode: "AUTO_WITH_DASHBOARD_REPORT",
    requiresApprovalFor: [],
    safetyNotes: "Chỉ hoạt động trong các nhóm Zalo đã được phân quyền quản lý.",
    setupSteps: ["Thêm AI vào nhóm Zalo", "Cấp quyền phó nhóm"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: false,
    includedInPlan: 'PRO'
  },
  {
    id: "AI_TEACHER_REMINDER",
    name: "AI Nhắc giáo viên",
    shortDescription: "Nhắc nhở giáo viên giao bài tập sau khi kết thúc buổi học.",
    fullDescription: "Tự động gửi tin nhắn nhắc nhở giáo viên giao bài tập về nhà trên nhóm Zalo hoặc hệ thống nội bộ ngay khi buổi học vừa kết thúc, đảm bảo tiến độ học thuật.",
    priceVndMonthly: 100000,
    category: "MANAGEMENT",
    recommendedFor: ["Giáo vụ", "Quản lý đào tạo"],
    channels: ["Zalo Inbox", "Internal Dashboard"],
    automationModes: ["REVIEW_REQUIRED", "OFF"],
    defaultMode: "REVIEW_REQUIRED",
    requiresApprovalFor: [],
    safetyNotes: "Tuân thủ khung giờ làm việc, không nhắc nhở vào đêm khuya.",
    setupSteps: ["Cấu hình thời gian nhắc", "Đồng bộ lịch dạy"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: false,
    includedInPlan: 'ENTERPRISE'
  },
  {
    id: "AI_HOMEWORK_GRADING_REPORT",
    name: "AI Chấm bài & Khen thưởng",
    shortDescription: "Chấm điểm, tặng sticker trên Zalo, nhắc nhở nộp bài.",
    fullDescription: "Tự động chấm điểm bài tập học viên gửi vào nhóm Zalo, tặng sticker khen ngợi lưu vào hồ sơ (SaaS). Tự động tag tên cảnh báo các bạn chưa làm bài và báo cáo danh sách cho CEO/Nhân viên.",
    priceVndMonthly: 300000,
    category: "ACADEMIC",
    recommendedFor: ["Giáo viên", "Học viên", "Trung tâm luyện thi"],
    channels: ["Zalo Group", "Internal Dashboard"],
    automationModes: ["TEACHER_APPROVAL_REQUIRED", "AUTO_WITH_DASHBOARD_REPORT", "OFF"],
    defaultMode: "TEACHER_APPROVAL_REQUIRED",
    requiresApprovalFor: ["Kết quả điểm số dưới trung bình"],
    safetyNotes: "Nên bật chế độ cần giáo viên duyệt trong tháng đầu tiên để AI học rubric chấm bài.",
    setupSteps: ["Tải lên rubric chấm bài", "Cấu hình ngân hàng sticker"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: true,
    includedInPlan: 'ENTERPRISE'
  },
  {
    id: "AI_ADMISSION_CONSULTANT",
    name: "AI Tư vấn Fanpage",
    shortDescription: "Tự động trả lời, xin SĐT và hẹn lịch học thử 24/7.",
    fullDescription: "AI đóng vai trò tư vấn viên trên Fanpage, trả lời tức thì mọi thắc mắc về khóa học, học phí, đồng thời khéo léo xin số điện thoại để đẩy về CRM cho Telesale.",
    priceVndMonthly: 350000,
    category: "SALES",
    recommendedFor: ["Marketing", "Sales"],
    channels: ["Fanpage"],
    automationModes: ["AUTO_FOR_LOW_RISK", "REVIEW_REQUIRED_FOR_HIGH_RISK", "OFF"],
    defaultMode: "REVIEW_REQUIRED_FOR_HIGH_RISK",
    requiresApprovalFor: ["Hỏi về ưu đãi/giảm giá", "Câu hỏi vượt ngoài kịch bản"],
    safetyNotes: "Tự động handoff (chuyển cho nhân viên) khi khách hàng không cung cấp SĐT sau 3 lượt hỏi.",
    setupSteps: ["Kết nối Fanpage", "Nạp tài liệu trung tâm (Knowledge Base)"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: false,
    includedInPlan: 'PRO'
  },
  {
    id: "AI_RENEWAL_CARE",
    name: "AI Nhắc tái phí Zalo",
    shortDescription: "Nhắc tái phí khéo léo qua Zalo OA/Cá nhân.",
    fullDescription: "Tự động theo dõi số buổi còn lại của học viên. Khi sắp hết hạn, AI sẽ nhắn tin Zalo khéo léo nhắc nhở phụ huynh gia hạn, follow-up tối đa 3 lần và báo cáo kết quả.",
    priceVndMonthly: 250000,
    category: "SALES",
    recommendedFor: ["Kế toán", "Sales"],
    channels: ["Zalo Inbox", "Zalo OA"],
    automationModes: ["AUTO_WITH_DASHBOARD_REPORT", "REVIEW_REQUIRED", "OFF"],
    defaultMode: "REVIEW_REQUIRED",
    requiresApprovalFor: ["Khách hàng từ chối tái phí", "Khách hàng khiếu nại"],
    safetyNotes: "Luôn dừng kịch bản nếu phát hiện từ khóa tiêu cực từ phụ huynh.",
    setupSteps: ["Soạn mẫu câu nhắc phí", "Cài đặt số buổi cảnh báo (VD: còn 2 buổi)"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: false,
    includedInPlan: 'ENTERPRISE'
  },
  {
    id: "AI_TELESALE_QA",
    name: "AI Chấm điểm Telesale",
    shortDescription: "Phân tích và chấm điểm file ghi âm cuộc gọi tư vấn.",
    fullDescription: "Tự động chuyển đổi giọng nói (Speech-to-Text) từ cuộc gọi của Sales, chấm điểm thái độ, tốc độ nói, và việc tuân thủ kịch bản (Script adherence). Đưa ra phân tích tại sao chốt deal xịt.",
    priceVndMonthly: 400000,
    category: "MANAGEMENT",
    recommendedFor: ["CEO", "Trưởng phòng Sales"],
    channels: ["Internal Dashboard"],
    automationModes: ["AUTO_WITH_DASHBOARD_REPORT", "OFF"],
    defaultMode: "AUTO_WITH_DASHBOARD_REPORT",
    requiresApprovalFor: [],
    safetyNotes: "Bảo mật tuyệt đối file ghi âm, chỉ người quản lý mới có quyền xem báo cáo.",
    setupSteps: ["Tích hợp tổng đài ảo", "Tải lên tiêu chí đánh giá QA"],
    demoStatus: "SANDBOX_ONLY",
    ctaLabel: "Dùng thử Sandbox",
    isInstalled: false,
    includedInPlan: 'ENTERPRISE'
  },
  {
    id: "AI_SENTIMENT_ALERT",
    name: "AI Phân tích Cảm xúc",
    shortDescription: "Cảnh báo khẩn cấp khi phụ huynh có thái độ tiêu cực.",
    fullDescription: "Nằm vùng toàn bộ tin nhắn Zalo/Fanpage. Phân tích Sentiment Real-time. Nếu phụ huynh phàn nàn, cáu gắt, AI lập tức bắn Push Notification cho CEO để xử lý khủng hoảng.",
    priceVndMonthly: 250000,
    category: "STUDENT_CARE",
    recommendedFor: ["CEO", "Trưởng phòng CSKH"],
    channels: ["All Channels"],
    automationModes: ["READ_ONLY_INSIGHTS", "OFF"],
    defaultMode: "READ_ONLY_INSIGHTS",
    requiresApprovalFor: [],
    safetyNotes: "Chỉ theo dõi các tài khoản công việc được phân quyền, bỏ qua tin nhắn cá nhân.",
    setupSteps: ["Bật quyền đọc tin nhắn toàn cầu", "Cấu hình số điện thoại nhận SMS cảnh báo"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: true
  },
  {
    id: "AI_CEO_COMMAND_CENTER",
    name: "AI Trợ lý CEO",
    shortDescription: "Hỏi đáp số liệu quản trị, đề xuất chiến lược.",
    fullDescription: "Trợ lý ảo phân tích toàn bộ dữ liệu Tuyển sinh, Tài chính, Đào tạo. Giúp CEO truy vấn bằng ngôn ngữ tự nhiên (VD: Tháng này có bao nhiêu học sinh nghỉ ngang?).",
    isPremium: true,
    priceVndMonthly: 800000,
    category: "MANAGEMENT",
    recommendedFor: ["CEO", "Chủ trung tâm"],
    channels: ["Internal Dashboard"],
    automationModes: ["READ_ONLY_INSIGHTS", "ACTION_DRAFTS_WITH_APPROVAL", "OFF"],
    defaultMode: "READ_ONLY_INSIGHTS",
    requiresApprovalFor: ["Thực thi tác vụ thay đổi dữ liệu"],
    safetyNotes: "Tính năng này chỉ dành cho tài khoản có role OWNER.",
    setupSteps: ["Cấp quyền phân tích Data Warehouse"],
    demoStatus: "PILOT_READY",
    ctaLabel: "Cài đặt",
    isInstalled: true,
    includedInPlan: 'ENTERPRISE'
  },
  {
    id: "AI_CONTENT_POSTING",
    name: "AI Content Posting",
    shortDescription: "Tao nhap bai dang marketing cho Fanpage/Zalo OA.",
    fullDescription: "AI chi tao ban nhap noi dung va lich goi y. Nhan vien phai duyet truoc khi dang, khong tu dong publish.",
    priceVndMonthly: 300000,
    category: "MARKETING",
    recommendedFor: ["Marketing", "CEO"],
    channels: ["Fanpage", "Zalo OA", "Internal Dashboard"],
    automationModes: ["DRAFT_ONLY", "SCHEDULE_WITH_APPROVAL", "OFF"],
    defaultMode: "DRAFT_ONLY",
    requiresApprovalFor: ["Moi noi dung dang cong khai", "Uu dai hoc phi", "Cam ket ket qua"],
    safetyNotes: "Khong tu dong dang cong khai. Noi dung uu dai, hoc phi, cam ket ket qua bat buoc can nguoi duyet.",
    setupSteps: ["Nhap guideline thuong hieu", "Tao lich noi dung", "Chon nguoi duyet"],
    demoStatus: "SANDBOX_ONLY",
    ctaLabel: "Tao nhap",
    isInstalled: false,
    includedInPlan: 'ENTERPRISE'
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
