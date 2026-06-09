import type { StudentCareMetrics, StudentRiskLevel } from './studentCareRisk';

export type LeadStage = 'LEAD_MOI' | 'DA_LIEN_HE' | 'DA_HEN_HOC_THU' | 'DA_HOC_THU' | 'DA_CHOT' | 'MAT_LEAD';
export type LifecycleStage =
  | 'LEAD_NEW'
  | 'LEAD_CONTACTED'
  | 'TRIAL_BOOKED'
  | 'TRIAL_ATTENDED'
  | 'STUDENT_ACTIVE'
  | 'STUDENT_AT_RISK'
  | 'STUDENT_PAUSED'
  | 'STUDENT_LOST'
  | 'ALUMNI';
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
  ALUMNI: 'Cựu học viên',
};

export interface CrmTimelineEvent {
  id: string;
  type:
    | 'LEAD_CREATED'
    | 'MESSAGE_RECEIVED'
    | 'STAFF_REPLY'
    | 'AI_SUGGESTION'
    | 'TRIAL_BOOKED'
    | 'TRIAL_ATTENDED'
    | 'TRIAL_MISSED'
    | 'CONVERTED_STUDENT'
    | 'CLASS_ASSIGNED'
    | 'ATTENDANCE_ABSENCE'
    | 'HOMEWORK_MISSING'
    | 'HOMEWORK_SUBMITTED'
    | 'TEACHER_NOTE'
    | 'PARENT_COMPLAINT'
    | 'ADMIN_HANDOFF'
    | 'TUITION_REMINDER_DRAFT'
    | 'PAYMENT_NOTE'
    | 'TASK_CREATED'
    | 'TASK_COMPLETED'
    | 'CHURN_RISK_ALERT'
    | 'RETENTION_CALL'
    | 'PARENT_REPORT_DRAFTED';
  timestamp: string;
  title: string;
  description: string;
  actor?: string;
  source?: string;
  aiMode?: string;
}

export interface CrmLead {
  id: string;
  name: string;
  parentName?: string;
  phone: string;
  source: string;
  assignedStaff: string;
  stage: LeadStage;
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
