export type LeadStage = 'LEAD_MOI' | 'DA_LIEN_HE' | 'DA_HEN_HOC_THU' | 'DA_HOC_THU' | 'DA_CHOT' | 'MAT_LEAD';
export type LeadRisk = 'NÓNG' | 'ẤM' | 'LẠNH' | 'QUÁ HẠN' | 'CẦN HANDOFF';
export type TaskStatus = 'MỚI' | 'ĐANG XỬ LÝ' | 'QUÁ HẠN' | 'HOÀN TẤT';

export interface CrmTimelineEvent {
  id: string;
  type: 'LEAD_CREATED' | 'MESSAGE_RECEIVED' | 'STAFF_REPLY' | 'AI_SUGGESTION' | 'TRIAL_BOOKED' | 'TASK_CREATED' | 'NOTE_ADDED';
  timestamp: string;
  title: string;
  description: string;
  actor?: string;
  aiMode?: string;
}

export interface CrmLead {
  id: string;
  name: string;
  phone: string; // Will be masked in UI
  source: string;
  assignedStaff: string;
  stage: LeadStage;
  riskBadge: LeadRisk;
  lastInteractionTime: string;
  lastInteractionDays: number;
  nextAction: string;
  aiSuggestion?: string;
  timeline: CrmTimelineEvent[];
}

export interface CrmTask {
  id: string;
  title: string;
  owner: string;
  dueTime: string;
  leadName: string;
  sourceChannel: string;
  status: TaskStatus;
  suggestedNextStep: string;
  automationMode: string;
}

// Logic: Determine risk based on days since last interaction
export function calculateLeadRisk(lastInteractionDays: number, stage: LeadStage, hasComplaint: boolean = false): LeadRisk {
  if (hasComplaint) return 'CẦN HANDOFF';
  if (stage === 'DA_CHOT' || stage === 'MAT_LEAD') return 'LẠNH';
  if (lastInteractionDays > 3) return 'LẠNH'; // Cold lead
  if (lastInteractionDays > 1) return 'QUÁ HẠN'; // Overdue response
  if (lastInteractionDays === 0) return 'NÓNG'; // Hot lead interacting today
  return 'ẤM';
}

export const mockTimeline: CrmTimelineEvent[] = [
  { id: '1', type: 'LEAD_CREATED', timestamp: '2 ngày trước', title: 'Lead mới từ Fanpage', description: 'Phụ huynh để lại tin nhắn hỏi khóa học.' },
  { id: '2', type: 'AI_SUGGESTION', timestamp: '2 ngày trước', title: 'AI đã tự động trả lời', description: 'Gửi thông tin tổng quan các khóa học cơ bản.', actor: 'AI Assistant', aiMode: 'AUTO_LOW_RISK' },
  { id: '3', type: 'MESSAGE_RECEIVED', timestamp: 'Hôm qua', title: 'Phụ huynh nhắn lại', description: '"Cho mình hỏi học phí bé 5 tuổi?"' },
  { id: '4', type: 'STAFF_REPLY', timestamp: 'Hôm qua', title: 'Nhân viên trả lời', description: 'Đã báo giá và mời học thử.', actor: 'Nguyễn Văn A' },
  { id: '5', type: 'TRIAL_BOOKED', timestamp: 'Vừa xong', title: 'Đã chốt lịch học thử', description: 'Học thử 18:00 Tối Thứ 6.' }
];

export const MOCK_LEADS: CrmLead[] = [
  {
    id: 'L01', name: 'Phụ huynh bé Na', phone: '[SĐT đã ẩn]', source: 'Fanpage', assignedStaff: 'Nguyễn Văn A',
    stage: 'LEAD_MOI', riskBadge: 'NÓNG', lastInteractionTime: '10 phút trước', lastInteractionDays: 0,
    nextAction: 'Trả lời tư vấn học phí', aiSuggestion: 'Gợi ý: "Dạ học phí bên em cho bé 5 tuổi là..."',
    timeline: mockTimeline
  },
  {
    id: 'L02', name: 'Anh Hoàng (Đăng ký học giao tiếp)', phone: '[SĐT đã ẩn]', source: 'Zalo OA', assignedStaff: 'Trần Thị B',
    stage: 'DA_LIEN_HE', riskBadge: 'QUÁ HẠN', lastInteractionTime: '2 ngày trước', lastInteractionDays: 2,
    nextAction: 'Gọi lại xác nhận nhu cầu',
    timeline: mockTimeline.slice(0, 3)
  },
  {
    id: 'L03', name: 'Chị Mai (Hỏi về HSK)', phone: '[SĐT đã ẩn]', source: 'Landing Page', assignedStaff: 'Nguyễn Văn A',
    stage: 'DA_LIEN_HE', riskBadge: 'LẠNH', lastInteractionTime: '5 ngày trước', lastInteractionDays: 5,
    nextAction: 'Gửi voucher re-marketing',
    timeline: mockTimeline.slice(0, 2)
  },
  {
    id: 'L04', name: 'Phụ huynh bé Bo', phone: '[SĐT đã ẩn]', source: 'Referral', assignedStaff: 'Trần Thị B',
    stage: 'DA_HEN_HOC_THU', riskBadge: 'ẤM', lastInteractionTime: 'Hôm qua', lastInteractionDays: 1,
    nextAction: 'Nhắc lịch học thử tối nay', aiSuggestion: 'Tạo Task: Nhắc phụ huynh trước 18h',
    timeline: mockTimeline
  },
  {
    id: 'L05', name: 'Học viên Tuấn (Phàn nàn)', phone: '[SĐT đã ẩn]', source: 'Zalo cá nhân', assignedStaff: 'Vũ Thị F',
    stage: 'DA_HOC_THU', riskBadge: 'CẦN HANDOFF', lastInteractionTime: '30 phút trước', lastInteractionDays: 0,
    nextAction: 'Admin cần gọi điện xoa dịu', aiSuggestion: 'Ngữ khí phẫn nộ, cần Quản lý can thiệp.',
    timeline: mockTimeline
  }
];

export const MOCK_TASKS: CrmTask[] = [
  { id: 'T01', title: 'Gọi lại phụ huynh sau 19:00', owner: 'Nguyễn Văn A', dueTime: 'Hôm nay, 19:00', leadName: 'Phụ huynh bé Bo', sourceChannel: 'Fanpage', status: 'MỚI', suggestedNextStep: 'Xác nhận lại lịch học thử', automationMode: 'AUTO_WITH_DASHBOARD_REPORT' },
  { id: 'T02', title: 'Chuyển admin xử lý khiếu nại', owner: 'Hoàng Văn E (Admin)', dueTime: 'Quá hạn 15p', leadName: 'Học viên Tuấn', sourceChannel: 'Zalo cá nhân', status: 'QUÁ HẠN', suggestedNextStep: 'Gọi xoa dịu ngay', automationMode: 'STAFF_HANDOFF' },
  { id: 'T03', title: 'Gửi bảng học phí', owner: 'Trần Thị B', dueTime: 'Hôm nay, 15:00', leadName: 'Anh Minh HSK', sourceChannel: 'Zalo OA', status: 'ĐANG XỬ LÝ', suggestedNextStep: 'Gửi file PDF Báo giá', automationMode: 'ADMIN_APPROVAL_REQUIRED' }
];
