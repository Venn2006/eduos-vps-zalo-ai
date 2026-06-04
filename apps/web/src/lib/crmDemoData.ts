import { StudentCareMetrics, calculateStudentCareRisk, StudentRiskLevel } from './studentCareRisk';

export type LeadStage = 'LEAD_MOI' | 'DA_LIEN_HE' | 'DA_HEN_HOC_THU' | 'DA_HOC_THU' | 'DA_CHOT' | 'MAT_LEAD';
export type LifecycleStage = 'LEAD_NEW' | 'LEAD_CONTACTED' | 'TRIAL_BOOKED' | 'TRIAL_ATTENDED' | 'STUDENT_ACTIVE' | 'STUDENT_AT_RISK' | 'STUDENT_PAUSED' | 'STUDENT_LOST' | 'ALUMNI';
export type LeadRisk = 'NÓNG' | 'ẤM' | 'LẠNH' | 'QUÁ HẠN' | 'CẦN HANDOFF';
export type TaskStatus = 'MỚI' | 'ĐANG XỬ LÝ' | 'QUÁ HẠN' | 'CHỜ DUYỆT' | 'HOÀN TẤT';

export const LIFECYCLE_LABELS: Record<LifecycleStage, string> = {
  LEAD_NEW: 'Lead mới',
  LEAD_CONTACTED: 'Đã liên hệ',
  TRIAL_BOOKED: 'Đã hẹn học thử',
  TRIAL_ATTENDED: 'Đã học thử',
  STUDENT_ACTIVE: 'Học viên đang học',
  STUDENT_AT_RISK: 'Có nguy cơ nghỉ',
  STUDENT_PAUSED: 'Tạm dừng',
  STUDENT_LOST: 'Đã mất',
  ALUMNI: 'Cựu học viên'
};

export interface CrmTimelineEvent {
  id: string;
  type: 'LEAD_CREATED' | 'MESSAGE_RECEIVED' | 'STAFF_REPLY' | 'AI_SUGGESTION' | 'TRIAL_BOOKED' | 'TRIAL_ATTENDED' | 'TRIAL_MISSED' | 'CONVERTED_STUDENT' | 'CLASS_ASSIGNED' | 'ATTENDANCE_ABSENCE' | 'HOMEWORK_MISSING' | 'HOMEWORK_SUBMITTED' | 'TEACHER_NOTE' | 'PARENT_COMPLAINT' | 'ADMIN_HANDOFF' | 'TUITION_REMINDER_DRAFT' | 'PAYMENT_NOTE' | 'TASK_CREATED' | 'TASK_COMPLETED' | 'CHURN_RISK_ALERT' | 'RETENTION_CALL';
  timestamp: string;
  title: string;
  description: string;
  actor?: string; // parent, student, staff, teacher, admin, AI, system
  source?: string; // Fanpage, Zalo OA, Zalo cá nhân, Zalo nhóm lớp, Call, In-center, Homework, Finance
  aiMode?: string;
}

export interface CrmLead {
  id: string;
  name: string;
  parentName?: string;
  phone: string; // Will be masked in UI
  source: string;
  assignedStaff: string;
  stage: LeadStage; // keeping for kanban backwards compat
  lifecycleStage: LifecycleStage;
  riskBadge: LeadRisk;
  careMetrics: StudentCareMetrics;
  careRiskLevel: StudentRiskLevel;
  lastInteractionTime: string;
  lastInteractionDays: number;
  nextAction: string;
  aiSuggestion?: string;
  timeline: CrmTimelineEvent[];
  classInfo?: string;
  remainingSessions?: number;
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
  reason?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: 'TUITION' | 'HOMEWORK' | 'COMPLAINT' | 'FOLLOW_UP' | 'SOCIAL';
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

export const mockTimelineLead: CrmTimelineEvent[] = [
  { id: '1', type: 'LEAD_CREATED', timestamp: '2 ngày trước', title: 'Lead mới từ Fanpage', description: 'Phụ huynh để lại tin nhắn hỏi khóa học.', source: 'Fanpage', actor: 'Hệ thống' },
  { id: '2', type: 'AI_SUGGESTION', timestamp: '2 ngày trước', title: 'AI đã tự động trả lời', description: 'Gửi thông tin tổng quan các khóa học cơ bản.', actor: 'AI', aiMode: 'AUTO_LOW_RISK', source: 'Fanpage' },
  { id: '3', type: 'MESSAGE_RECEIVED', timestamp: 'Hôm qua', title: 'Phụ huynh nhắn lại', description: '"Cho mình hỏi học phí bé 5 tuổi?"', actor: 'Phụ huynh', source: 'Fanpage' },
  { id: '4', type: 'STAFF_REPLY', timestamp: 'Hôm qua', title: 'Nhân viên trả lời', description: 'Đã báo giá và mời học thử.', actor: 'Nguyễn Văn A (Staff)', source: 'Fanpage' },
  { id: '5', type: 'TRIAL_BOOKED', timestamp: 'Vừa xong', title: 'Đã chốt lịch học thử', description: 'Học thử 18:00 Tối Thứ 6.', actor: 'Nguyễn Văn A (Staff)', source: 'Zalo OA' }
];

export const mockTimelineStudent: CrmTimelineEvent[] = [
  { id: '101', type: 'CONVERTED_STUDENT', timestamp: '2 tháng trước', title: 'Đã chốt đăng ký học', description: 'Đóng học phí khóa 3 tháng.', actor: 'Admin', source: 'Finance' },
  { id: '102', type: 'CLASS_ASSIGNED', timestamp: '2 tháng trước', title: 'Xếp lớp thành công', description: 'Lớp Tiếng Anh Giao Tiếp Cơ Bản (Tối T3-T5).', actor: 'Admin', source: 'Hệ thống' },
  { id: '103', type: 'HOMEWORK_MISSING', timestamp: '1 tuần trước', title: 'Thiếu bài tập về nhà', description: 'Chưa nộp bài Unit 4.', actor: 'Trần Giáo Viên (Teacher)', source: 'Homework' },
  { id: '104', type: 'ATTENDANCE_ABSENCE', timestamp: 'Hôm qua', title: 'Nghỉ học không phép', description: 'Học viên vắng mặt buổi thứ 12.', actor: 'Hệ thống', source: 'Attendance' },
  { id: '105', type: 'PARENT_COMPLAINT', timestamp: 'Hôm nay', title: 'Phụ huynh phản ánh', description: '"Sao cháu đi học về bảo không hiểu bài hả em?"', actor: 'Phụ huynh', source: 'Zalo cá nhân' },
  { id: '106', type: 'CHURN_RISK_ALERT', timestamp: 'Vừa xong', title: 'Cảnh báo nguy cơ nghỉ học', description: 'Vắng mặt + Bài tập thiếu + Phụ huynh phàn nàn.', actor: 'AI', source: 'Hệ thống', aiMode: 'STAFF_HANDOFF' }
];

export const mockTimelineAlumni: CrmTimelineEvent[] = [
  { id: '201', type: 'CONVERTED_STUDENT', timestamp: '1 năm trước', title: 'Đã chốt đăng ký học', description: 'Đóng học phí khóa 6 tháng.', actor: 'Admin', source: 'Finance' },
  { id: '202', type: 'TUITION_REMINDER_DRAFT', timestamp: '6 tháng trước', title: 'Tạo nháp nhắc phí tái đăng ký', description: 'Sắp hết hạn khóa học.', actor: 'AI', aiMode: 'ADMIN_APPROVAL_REQUIRED', source: 'Finance' },
  { id: '203', type: 'MESSAGE_RECEIVED', timestamp: '5 tháng trước', title: 'Phụ huynh thông báo nghỉ', description: '"Cháu nhà bận lịch học thêm trên trường nên xin nghỉ ạ."', actor: 'Phụ huynh', source: 'Zalo OA' },
  { id: '204', type: 'RETENTION_CALL', timestamp: 'Hôm nay', title: 'Gọi điện re-marketing', description: 'Mời tham gia khóa học hè ưu đãi 20%.', actor: 'Nhân viên Sale', source: 'Call' }
];

export const MOCK_LEADS: CrmLead[] = [
  {
    id: 'L01', name: 'Phụ huynh bé Na', parentName: 'Mẹ bé Na', phone: '[SĐT đã ẩn]', source: 'Fanpage', assignedStaff: 'Nguyễn Văn A',
    stage: 'LEAD_MOI', lifecycleStage: 'LEAD_NEW', riskBadge: 'NÓNG', lastInteractionTime: '10 phút trước', lastInteractionDays: 0,
    nextAction: 'Trả lời tư vấn học phí', aiSuggestion: 'Gợi ý: "Dạ học phí bên em cho bé 5 tuổi là..."',
    timeline: mockTimelineLead,
    careMetrics: { recentAbsences: 0, homeworkMissing: 0, parentSentiment: 'NEUTRAL', debtOverdueDays: 0, trialMissed: false, unansweredDays: 0, hasComplaint: false },
    careRiskLevel: 'Bình thường'
  },
  {
    id: 'L02', name: 'Anh Hoàng', phone: '[SĐT đã ẩn]', source: 'Zalo OA', assignedStaff: 'Trần Thị B',
    stage: 'DA_LIEN_HE', lifecycleStage: 'LEAD_CONTACTED', riskBadge: 'QUÁ HẠN', lastInteractionTime: '2 ngày trước', lastInteractionDays: 2,
    nextAction: 'Gọi lại xác nhận nhu cầu',
    timeline: mockTimelineLead.slice(0, 3),
    careMetrics: { recentAbsences: 0, homeworkMissing: 0, parentSentiment: 'NEUTRAL', debtOverdueDays: 0, trialMissed: false, unansweredDays: 2, hasComplaint: false },
    careRiskLevel: 'Cần chú ý'
  },
  {
    id: 'L04', name: 'Bé Bo', parentName: 'Bố bé Bo', phone: '[SĐT đã ẩn]', source: 'Referral', assignedStaff: 'Trần Thị B',
    stage: 'DA_HEN_HOC_THU', lifecycleStage: 'TRIAL_BOOKED', riskBadge: 'ẤM', lastInteractionTime: 'Hôm qua', lastInteractionDays: 1,
    nextAction: 'Nhắc lịch học thử tối nay', aiSuggestion: 'Tạo Task: Nhắc phụ huynh trước 18h',
    timeline: mockTimelineLead,
    careMetrics: { recentAbsences: 0, homeworkMissing: 0, parentSentiment: 'POSITIVE', debtOverdueDays: 0, trialMissed: false, unansweredDays: 0, hasComplaint: false },
    careRiskLevel: 'Bình thường'
  },
  {
    id: 'L05', name: 'Học viên Tuấn', parentName: 'Chị Lan (Mẹ Tuấn)', phone: '[SĐT đã ẩn]', source: 'Zalo cá nhân', assignedStaff: 'Vũ Thị F',
    stage: 'DA_HOC_THU', lifecycleStage: 'STUDENT_AT_RISK', riskBadge: 'CẦN HANDOFF', lastInteractionTime: '30 phút trước', lastInteractionDays: 0,
    nextAction: 'Admin cần gọi điện xoa dịu', aiSuggestion: 'Ngữ khí phẫn nộ, cần Quản lý can thiệp.',
    timeline: mockTimelineStudent,
    classInfo: 'Giao Tiếp Cơ Bản K42',
    remainingSessions: 14,
    careMetrics: { recentAbsences: 1, homeworkMissing: 2, parentSentiment: 'NEGATIVE', debtOverdueDays: 0, trialMissed: false, unansweredDays: 0, hasComplaint: true },
    careRiskLevel: 'Khiếu nại/Cần handoff'
  },
  {
    id: 'L06', name: 'Học viên Mai', parentName: 'Chị Hoa', phone: '[SĐT đã ẩn]', source: 'Zalo OA', assignedStaff: 'Hoàng Văn E',
    stage: 'DA_CHOT', lifecycleStage: 'STUDENT_ACTIVE', riskBadge: 'ẤM', lastInteractionTime: '1 tuần trước', lastInteractionDays: 7,
    nextAction: 'Gửi nhắc nhở học phí',
    timeline: [
      { id: '301', type: 'CONVERTED_STUDENT', timestamp: '3 tháng trước', title: 'Đăng ký khóa học', description: 'Khóa Ielts 6.5', actor: 'Admin' },
      { id: '302', type: 'TUITION_REMINDER_DRAFT', timestamp: 'Hôm nay', title: 'Đến hạn đóng học phí đợt 2', description: 'Tạo task nhắc phí.', actor: 'Hệ thống' }
    ],
    classInfo: 'IELTS 6.5 K12',
    remainingSessions: 20,
    careMetrics: { recentAbsences: 0, homeworkMissing: 0, parentSentiment: 'NEUTRAL', debtOverdueDays: 8, trialMissed: false, unansweredDays: 0, hasComplaint: false },
    careRiskLevel: 'Nguy cơ nghỉ cao'
  }
];

export const MOCK_TASKS: CrmTask[] = [
  { id: 'T01', title: 'Gọi lại phụ huynh sau 19:00', owner: 'Nguyễn Văn A', dueTime: 'Hôm nay, 19:00', leadName: 'Phụ huynh bé Bo', sourceChannel: 'Fanpage', status: 'MỚI', suggestedNextStep: 'Xác nhận lại lịch học thử', automationMode: 'AUTO_WITH_DASHBOARD_REPORT', priority: 'MEDIUM', category: 'FOLLOW_UP' },
  { id: 'T02', title: 'Chuyển admin xử lý khiếu nại', owner: 'Hoàng Văn E (Admin)', dueTime: 'Quá hạn 15p', leadName: 'Học viên Tuấn', sourceChannel: 'Zalo cá nhân', status: 'QUÁ HẠN', suggestedNextStep: 'Gọi xoa dịu ngay', automationMode: 'STAFF_HANDOFF', priority: 'HIGH', category: 'COMPLAINT', reason: 'Phụ huynh bực mình do học viên không hiểu bài' },
  { id: 'T03', title: 'Gửi bảng học phí (Đã duyệt)', owner: 'Trần Thị B', dueTime: 'Hôm nay, 15:00', leadName: 'Anh Hoàng', sourceChannel: 'Zalo OA', status: 'ĐANG XỬ LÝ', suggestedNextStep: 'Gửi file PDF Báo giá', automationMode: 'ADMIN_APPROVAL_REQUIRED', priority: 'MEDIUM', category: 'TUITION' },
  { id: 'T04', title: 'Nhắc đóng học phí đợt 2', owner: 'Kế toán', dueTime: 'Hôm nay, 16:00', leadName: 'Học viên Mai', sourceChannel: 'Zalo OA', status: 'CHỜ DUYỆT', suggestedNextStep: 'Duyệt tin nhắn nhắc phí tự động', automationMode: 'ADMIN_APPROVAL_REQUIRED', priority: 'HIGH', category: 'TUITION', reason: 'Quá hạn phí 8 ngày' },
  { id: 'T05', title: 'Nhắc nộp bài tập Unit 4', owner: 'Trần Giáo Viên', dueTime: 'Ngày mai', leadName: 'Học viên Tuấn', sourceChannel: 'Zalo nhóm lớp', status: 'CHỜ DUYỆT', suggestedNextStep: 'Duyệt gửi thông báo thiếu bài', automationMode: 'TEACHER_APPROVAL_REQUIRED', priority: 'LOW', category: 'HOMEWORK' }
];
