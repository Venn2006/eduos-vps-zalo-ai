export const demoStoryline = [
  { route: '/workspaces', title: 'Workspaces', desc: 'Hệ điều hành vận hành trung tâm phân quyền (role-based).' },
  { route: '/crm-command-center', title: 'CRM Command Center', desc: 'Quản lý leads, follow-up, chăm sóc phụ huynh.' },
  { route: '/workspaces/teacher', title: 'Teacher Workspace', desc: 'Lịch giảng dạy, học vụ và xử lý xung đột (conflicts).' },
  { route: '/homework', title: 'Homework & Curriculum', desc: 'AI tạo nháp chấm điểm và tự động tạo giáo trình.' },
  { route: '/workspaces/finance', title: 'Finance Workspace', desc: 'Báo cáo doanh thu, công nợ, điểm danh (sessions).' },
  { route: '/approval-queue', title: 'Approval Queue', desc: 'Quy trình kiểm duyệt bởi con người (Human-in-the-loop).' },
  { route: '/settings/mock-outbox', title: 'Mock Outbox', desc: 'Hộp thư đi ảo trong Sandbox, không gửi thật.' },
  { route: '/settings/safety-center', title: 'Safety Center', desc: 'Kiểm soát an toàn, connector, readiness (Bạn đang ở đây).' },
  { route: '/ai-addons', title: 'AI Add-ons', desc: 'Các gói add-on AI (monetization).' }
];

export const demoMessaging = [
  'EduOS là hệ điều hành vận hành trung tâm, không phải chatbot.',
  'AI chỉ gợi ý, nháp, cảnh báo; việc nhạy cảm cần người duyệt.',
  'Bản demo không gửi tin thật, không gọi API thật, không kết nối ngân hàng thật.',
  'Dữ liệu thật chỉ xử lý khi trung tâm consent và pilot được duyệt.'
];

export const doNotPromise = [
  'Hôm nay chưa gửi Zalo thật (No real Zalo sending today)',
  'Hôm nay chưa kết nối ngân hàng thật (No live bank reconciliation today)',
  'Hôm nay AI chưa chấm điểm cuối cùng (No AI final grading today)',
  'Hôm nay chưa tự động tính lương (No payroll automation today)',
  'Không bao giờ scrape tin nhắn cá nhân (No private chat scraping)',
  'Chưa bật production connector worker'
];

export const pilotNextSteps = [
  'Chọn 1 trung tâm (choose one tenant)',
  'Chọn 1 module (choose one module)',
  'Chọn 1 nguồn dữ liệu an toàn (choose one safe data source)',
  'Ký xác nhận Consent (define consent)',
  'Chạy thử import trên Sandbox (run sandbox import)',
  'Đánh giá log (review audit)',
  'Quyết định chạy Pilot có kiểm soát (decide controlled pilot)'
];
