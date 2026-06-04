export type AutomationMode =
  | 'AUTO_LOW_RISK'
  | 'AUTO_WITH_DASHBOARD_REPORT'
  | 'STAFF_HANDOFF'
  | 'TEACHER_APPROVAL_REQUIRED'
  | 'ADMIN_APPROVAL_REQUIRED'
  | 'DRAFT_ONLY'
  | 'OFF';

export interface AutomationScenario {
  intent: 'LEAD_FAQ' | 'TRIAL_BOOKING' | 'RENEWAL_CARE' | 'HOMEWORK_GRADING' | 'PARENT_REPORT' | 'COMPLAINT' | 'TUITION_REMINDER' | 'OTHER';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  followUpCount?: number;
  aiAddonEnabled: boolean;
}

export function determineAutomationMode(scenario: AutomationScenario): AutomationMode {
  if (!scenario.aiAddonEnabled) {
    return 'OFF';
  }

  switch (scenario.intent) {
    case 'COMPLAINT':
      return 'STAFF_HANDOFF';
      
    case 'HOMEWORK_GRADING':
      return 'TEACHER_APPROVAL_REQUIRED';
      
    case 'PARENT_REPORT':
      return 'TEACHER_APPROVAL_REQUIRED'; // Can be ADMIN_APPROVAL_REQUIRED based on specific center policy, but defaults to TEACHER
      
    case 'TUITION_REMINDER':
      return 'ADMIN_APPROVAL_REQUIRED';
      
    case 'RENEWAL_CARE':
      if (scenario.followUpCount && scenario.followUpCount >= 3) {
        return 'STAFF_HANDOFF';
      }
      return 'AUTO_WITH_DASHBOARD_REPORT';
      
    case 'TRIAL_BOOKING':
      return 'AUTO_WITH_DASHBOARD_REPORT';
      
    case 'LEAD_FAQ':
      if (scenario.riskLevel === 'HIGH') {
        return 'STAFF_HANDOFF';
      }
      return 'AUTO_LOW_RISK';
      
    default:
      if (scenario.riskLevel === 'HIGH') return 'STAFF_HANDOFF';
      return 'DRAFT_ONLY';
  }
}

export function getAutomationModeLabel(mode: AutomationMode): string {
  switch (mode) {
    case 'AUTO_LOW_RISK':
      return 'Tự động (Rủi ro thấp)';
    case 'AUTO_WITH_DASHBOARD_REPORT':
      return 'Tự động (Báo cáo Dashboard)';
    case 'STAFF_HANDOFF':
      return 'Chuyển người xử lý';
    case 'TEACHER_APPROVAL_REQUIRED':
      return 'Giáo viên duyệt';
    case 'ADMIN_APPROVAL_REQUIRED':
      return 'Admin duyệt';
    case 'DRAFT_ONLY':
      return 'Chỉ tạo nháp';
    case 'OFF':
      return 'Tắt AI';
    default:
      return mode;
  }
}
