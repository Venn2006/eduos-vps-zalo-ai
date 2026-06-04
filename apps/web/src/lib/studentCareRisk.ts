export type StudentRiskLevel = 'Bình thường' | 'Cần chú ý' | 'Nguy cơ nghỉ cao' | 'Khiếu nại/Cần handoff';

export interface StudentCareMetrics {
  recentAbsences: number;
  homeworkMissing: number;
  parentSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  debtOverdueDays: number;
  trialMissed: boolean;
  unansweredDays: number;
  hasComplaint: boolean;
}

export function calculateStudentCareRisk(metrics: StudentCareMetrics): StudentRiskLevel {
  if (metrics.hasComplaint || metrics.parentSentiment === 'NEGATIVE') {
    return 'Khiếu nại/Cần handoff';
  }
  
  if (metrics.recentAbsences >= 2 || metrics.homeworkMissing >= 3 || metrics.debtOverdueDays > 7) {
    return 'Nguy cơ nghỉ cao';
  }
  
  if (metrics.recentAbsences === 1 || metrics.unansweredDays > 1 || metrics.trialMissed) {
    return 'Cần chú ý';
  }
  
  return 'Bình thường';
}
