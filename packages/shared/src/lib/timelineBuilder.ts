export type TimelineEventType = 
  | 'LEAD_CREATED'
  | 'MESSAGE_CLASSIFIED'
  | 'CALL_LOGGED'
  | 'FOLLOW_UP_CREATED'
  | 'TRIAL_BOOKING_CREATED'
  | 'TRIAL_ATTENDED'
  | 'PAYMENT_RECORDED'
  | 'TUITION_DUE'
  | 'ABSENCE_RECORDED'
  | 'ABSENCE_REQUESTED'
  | 'HOMEWORK_ASSIGNED'
  | 'HOMEWORK_SUBMITTED'
  | 'TEACHER_FEEDBACK_CREATED'
  | 'AI_DRAFT_CREATED'
  | 'PARENT_COMPLAINT_DETECTED'
  | 'RISK_DETECTED'
  | 'UNKNOWN';

export type TimelineActorType = 'SYSTEM' | 'AI' | 'STAFF' | 'LEAD' | 'STUDENT' | 'PARENT';

export type TimelineVisibilityScope = 'OWNER_ADMIN' | 'SALES' | 'TEACHER' | 'FINANCE' | 'LIMITED';

export type TimelineSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SafeTimelineEvent {
  id: string;
  occurredAt: Date;
  type: TimelineEventType;
  title: string;
  safeSummary: string;
  actorLabel: string;
  actorType: TimelineActorType;
  source: string;
  severity: TimelineSeverity;
  tags?: string[];
  relatedEntityType?: string;
  relatedEntityId?: string;
  visibility: TimelineVisibilityScope[]; // Roles allowed to see this event
}

const PHONE_REGEX = /(?:(?:\+|00)84|0)\s*?[3|5|7|8|9](?:\s*?\d){8}\b/g;
const SECRET_REGEX = /(?:mật\s*khẩu|password|pass|otp|token|api\s*key).{0,30}?(?:là|is|:|=)\s*([a-zA-Z0-9!@#$%^&*]+)/gi;

export function redactSensitiveInfo(text: string): string {
  if (!text) return text;
  let result = text.replace(PHONE_REGEX, "[SĐT BẢO MẬT]");
  result = result.replace(SECRET_REGEX, "[BẢO MẬT]");
  return result;
}

export function filterTimelineForRole(
  events: SafeTimelineEvent[], 
  userRole: "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN"
): SafeTimelineEvent[] {
  if (userRole === "UNKNOWN" || !userRole) return [];
  if (userRole === "OWNER" || userRole === "ADMIN") {
    // Return all, sorted by occurredAt descending
    return [...events].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  let allowedScope: TimelineVisibilityScope | null = null;
  if (userRole === "SALE") allowedScope = "SALES";
  if (userRole === "TEACHER") allowedScope = "TEACHER";
  if (userRole === "ACCOUNTANT") allowedScope = "FINANCE";

  const filtered = events.filter(e => {
    // If event allows the specific role's scope, or LIMITED (which could mean public/basic info)
    return allowedScope && (e.visibility.includes(allowedScope) || e.visibility.includes('LIMITED'));
  });

  return filtered.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

// Helper to quickly build a standardized event
export function buildTimelineEvent(params: {
  id: string;
  occurredAt: Date;
  type: TimelineEventType;
  title: string;
  rawSummary: string;
  actorLabel: string;
  actorType: TimelineActorType;
  source: string;
  severity?: TimelineSeverity;
  tags?: string[];
  relatedEntityType?: string;
  relatedEntityId?: string;
  visibility?: TimelineVisibilityScope[];
}): SafeTimelineEvent {
  
  let severity = params.severity || 'LOW';
  if (params.type === 'PARENT_COMPLAINT_DETECTED' || params.type === 'RISK_DETECTED') {
    severity = 'HIGH'; // Baseline, caller can override to CRITICAL
  }

  // Default visibility logic if not provided
  let visibility = params.visibility || ['OWNER_ADMIN'];
  if (!params.visibility) {
    if (params.type.includes('PAYMENT') || params.type.includes('TUITION')) {
      visibility = ['OWNER_ADMIN', 'FINANCE'];
    } else if (params.type.includes('LEAD') || params.type.includes('CALL') || params.type.includes('TRIAL')) {
      visibility = ['OWNER_ADMIN', 'SALES'];
    } else if (params.type.includes('HOMEWORK') || params.type.includes('ABSENCE') || params.type.includes('TEACHER')) {
      visibility = ['OWNER_ADMIN', 'TEACHER'];
    } else {
      visibility = ['OWNER_ADMIN', 'SALES', 'TEACHER', 'FINANCE', 'LIMITED'];
    }
  }

  return {
    id: params.id,
    occurredAt: params.occurredAt,
    type: params.type,
    title: params.title,
    safeSummary: redactSensitiveInfo(params.rawSummary),
    actorLabel: params.actorLabel,
    actorType: params.actorType,
    source: params.source,
    severity: params.severity || severity,
    tags: params.tags,
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
    visibility
  };
}
