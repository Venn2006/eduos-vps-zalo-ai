import { SafeTimelineEvent, redactSensitiveInfo } from './timelineBuilder';
import { IntelligenceResult } from './conversationIntelligence';

export type CEORiskCategory = 
  | 'PARENT_COMPLAINT'
  | 'UNANSWERED_LEAD'
  | 'TRIAL_BOOKING_RISK'
  | 'TUITION_RISK'
  | 'STUDENT_ABSENCE_RISK'
  | 'HOMEWORK_RISK'
  | 'MESSAGE_QUALITY_RISK'
  | 'AI_DRAFT_PENDING'
  | 'CONNECTOR_RISK'
  | 'GENERAL';

export type CEOOverallStatus = 'OK' | 'NEEDS_ATTENTION' | 'URGENT';
export type CEORiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CEORiskCard {
  id: string;
  title: string;
  safeSummary: string;
  severity: CEORiskSeverity;
  category: CEORiskCategory;
  recommendedAction: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  tags?: string[];
}

export interface CEOMetrics {
  urgentCount: number;
  highRiskCount: number;
  parentComplaintCount: number;
  trialBookingRequestCount: number;
  tuitionQuestionCount: number;
  unansweredLeadCount: number;
  pendingDraftCount: number;
  followUpDueCount: number;
}

export interface CEOIntelligenceOutput {
  overallStatus: CEOOverallStatus;
  headline: string;
  summaryBullets: string[];
  urgentItems: CEORiskCard[];
  riskCards: CEORiskCard[];
  recommendedActions: string[];
  metrics: CEOMetrics;
}

export interface CEOIntelligenceInput {
  conversationAnalyses?: IntelligenceResult[];
  timelineEvents?: SafeTimelineEvent[];
  pendingDraftCount?: number;
  followUpTasks?: any[]; // Allow generic structure for follow up tasks
  currentDate?: Date; // For deterministic tests
}

export function generateCEOIntelligence(input: CEOIntelligenceInput): CEOIntelligenceOutput {
  const currentDate = input.currentDate || new Date();
  
  const riskCards: CEORiskCard[] = [];
  const urgentItems: CEORiskCard[] = [];
  
  const metrics: CEOMetrics = {
    urgentCount: 0,
    highRiskCount: 0,
    parentComplaintCount: 0,
    trialBookingRequestCount: 0,
    tuitionQuestionCount: 0,
    unansweredLeadCount: 0,
    pendingDraftCount: input.pendingDraftCount || 0,
    followUpDueCount: 0
  };

  // 1. Process Timeline Events
  if (input.timelineEvents) {
    for (const event of input.timelineEvents) {
      if (event.type === 'PARENT_COMPLAINT_DETECTED') {
        metrics.parentComplaintCount++;
        riskCards.push({
          id: `risk_${event.id}`,
          title: 'Phụ huynh phàn nàn',
          safeSummary: event.safeSummary, // timelineBuilder already redacts this, but we can redact again just in case
          severity: 'HIGH', // Could be CRITICAL if we had more context
          category: 'PARENT_COMPLAINT',
          recommendedAction: 'Gọi điện thoại hỗ trợ và xin lỗi ngay lập tức.',
          relatedEntityType: event.relatedEntityType,
          relatedEntityId: event.relatedEntityId,
          tags: event.tags,
        });
      } else if (event.type === 'RISK_DETECTED') {
        riskCards.push({
          id: `risk_${event.id}`,
          title: 'Cảnh báo rủi ro',
          safeSummary: event.safeSummary,
          severity: event.severity as CEORiskSeverity,
          category: 'GENERAL',
          recommendedAction: 'Kiểm tra chi tiết và phân công nhân sự xử lý.',
          relatedEntityType: event.relatedEntityType,
          relatedEntityId: event.relatedEntityId,
        });
      } else if (event.type === 'TUITION_DUE') {
        riskCards.push({
          id: `risk_${event.id}`,
          title: 'Học phí sắp đến hạn',
          safeSummary: event.safeSummary,
          severity: 'MEDIUM',
          category: 'TUITION_RISK',
          recommendedAction: 'Gửi tin nhắn nhắc nhở đóng học phí.',
        });
      }
    }
  }

  // 2. Process Conversation Analyses (from Fanpage / Zalo inbox)
  if (input.conversationAnalyses) {
    for (const analysis of input.conversationAnalyses) {
      if (analysis.intent === 'PARENT_COMPLAINT' || analysis.severity === 'CRITICAL') {
        riskCards.push({
          id: `conv_${Math.random()}`, // Simple ID for now
          title: 'Tin nhắn tiêu cực',
          safeSummary: redactSensitiveInfo(analysis.safeSummary),
          severity: 'HIGH',
          category: 'MESSAGE_QUALITY_RISK',
          recommendedAction: 'Trực tiếp xử lý tin nhắn thay vì dùng AI tự động.',
          tags: analysis.suggestedTags
        });
      }

      if (analysis.suggestedTags?.includes('Hỏi học phí') || analysis.intent === 'TUITION_QUESTION') {
        metrics.tuitionQuestionCount++;
      }
      if (analysis.suggestedTags?.includes('Xin học thử') || analysis.intent === 'TRIAL_BOOKING_REQUEST') {
        metrics.trialBookingRequestCount++;
      }
      if (analysis.suggestedTags?.includes('Chưa phản hồi')) {
        metrics.unansweredLeadCount++;
        riskCards.push({
          id: `conv_${Math.random()}`,
          title: 'Tin nhắn chưa phản hồi',
          safeSummary: redactSensitiveInfo(analysis.safeSummary),
          severity: 'MEDIUM',
          category: 'UNANSWERED_LEAD',
          recommendedAction: 'Phân công Sale hoặc Giáo viên trả lời tin nhắn.',
          tags: analysis.suggestedTags
        });
      }
    }
  }

  // 3. Process Follow Ups
  if (input.followUpTasks) {
    for (const task of input.followUpTasks) {
      const isDue = new Date(task.dueDate || task.createdAt) <= currentDate;
      if (isDue && task.status !== 'COMPLETED') {
        metrics.followUpDueCount++;
      }
    }
    if (metrics.followUpDueCount > 0) {
      riskCards.push({
        id: `followup_due`,
        title: 'Follow-up đến hạn',
        safeSummary: `Có ${metrics.followUpDueCount} công việc follow-up cần thực hiện hôm nay.`,
        severity: 'MEDIUM',
        category: 'UNANSWERED_LEAD',
        recommendedAction: 'Nhắc nhở nhân viên kinh doanh hoàn thành follow-up.'
      });
    }
  }

  // 4. Pending AI drafts
  if (metrics.pendingDraftCount > 0) {
    riskCards.push({
      id: `drafts_pending`,
      title: 'Nháp AI chờ duyệt',
      safeSummary: `Có ${metrics.pendingDraftCount} tin nhắn do AI nháp đang chờ bạn duyệt.`,
      severity: 'LOW',
      category: 'AI_DRAFT_PENDING',
      recommendedAction: 'Kiểm tra và duyệt các tin nhắn nháp để AI tự động gửi đi.'
    });
  }

  // Categorize risks
  for (const risk of riskCards) {
    if (risk.severity === 'HIGH' || risk.severity === 'CRITICAL') {
      metrics.highRiskCount++;
      urgentItems.push(risk);
    }
  }

  metrics.urgentCount = urgentItems.length;

  let overallStatus: CEOOverallStatus = 'OK';
  if (metrics.highRiskCount > 1 || metrics.parentComplaintCount > 0) {
    overallStatus = 'URGENT';
  } else if (metrics.highRiskCount === 1 || metrics.pendingDraftCount > 0 || metrics.followUpDueCount > 0) {
    overallStatus = 'NEEDS_ATTENTION';
  }

  let headline = 'Mọi thứ đang hoạt động ổn định.';
  if (overallStatus === 'URGENT') {
    headline = 'Có rủi ro nghiêm trọng cần CEO xử lý ngay!';
  } else if (overallStatus === 'NEEDS_ATTENTION') {
    headline = 'Có vài vấn đề cần bạn chú ý hôm nay.';
  }

  const summaryBullets: string[] = [];
  if (metrics.parentComplaintCount > 0) {
    summaryBullets.push(`${metrics.parentComplaintCount} phụ huynh đang phàn nàn/tiêu cực.`);
  }
  if (metrics.unansweredLeadCount > 0) {
    summaryBullets.push(`${metrics.unansweredLeadCount} lead chưa được tư vấn viên phản hồi.`);
  }
  if (metrics.pendingDraftCount > 0) {
    summaryBullets.push(`${metrics.pendingDraftCount} tin nhắn nháp AI cần bạn duyệt.`);
  }
  if (metrics.followUpDueCount > 0) {
    summaryBullets.push(`${metrics.followUpDueCount} lịch follow-up chưa hoàn thành.`);
  }
  if (summaryBullets.length === 0) {
    summaryBullets.push('Không có thông báo mới. Các chỉ số đều tích cực.');
  }

  const recommendedActions: string[] = Array.from(new Set(riskCards.map(r => r.recommendedAction)));
  if (recommendedActions.length === 0) {
    recommendedActions.push('Tiếp tục duy trì chất lượng chăm sóc học viên.');
  }

  return {
    overallStatus,
    headline,
    summaryBullets,
    urgentItems,
    riskCards: riskCards.filter(r => r.severity !== 'HIGH' && r.severity !== 'CRITICAL'),
    recommendedActions,
    metrics
  };
}
