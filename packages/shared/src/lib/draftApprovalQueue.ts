import { UserRole } from './rbac';
import { redactSensitiveInfo } from './timelineBuilder';

export type DraftApprovalStatus = 
  | 'PENDING_REVIEW'
  | 'NEEDS_EDIT'
  | 'APPROVED_FOR_MANUAL_USE'
  | 'REJECTED'
  | 'CANCELLED'
  | 'BLOCKED_BY_GUARDRAIL';

export type DraftCategory = 'SALES' | 'ACADEMIC' | 'FINANCE' | 'GENERAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DraftApprovalRequest {
  draftId: string;
  category: DraftCategory;
  riskLevel: RiskLevel;
  content: string;
  guardrailStatus: 'SAFE' | 'NEEDS_REVIEW' | 'BLOCKED';
}

export interface ApprovalResult {
  status: DraftApprovalStatus;
  safeSummary: string;
  canApproveForManualUse: boolean;
  message: string;
}

export function getVietnameseStatusLabel(status: DraftApprovalStatus): string {
  switch (status) {
    case 'PENDING_REVIEW': return 'Nháp cần duyệt';
    case 'NEEDS_EDIT': return 'Cần sửa';
    case 'APPROVED_FOR_MANUAL_USE': return 'Duyệt nháp để sử dụng thủ công';
    case 'REJECTED': return 'Từ chối';
    case 'CANCELLED': return 'Đã hủy';
    case 'BLOCKED_BY_GUARDRAIL': return 'Chặn bởi AI Guardrail';
    default: return 'Không xác định';
  }
}

export function evaluateDraftApproval(
  request: DraftApprovalRequest,
  userRole: UserRole,
  isAssignedToUser: boolean = false
): ApprovalResult {
  const safeContent = redactSensitiveInfo(request.content);
  const result: ApprovalResult = {
    status: 'PENDING_REVIEW',
    safeSummary: safeContent,
    canApproveForManualUse: false,
    message: ''
  };

  // 1. Guardrail checks
  if (request.guardrailStatus === 'BLOCKED') {
    result.status = 'BLOCKED_BY_GUARDRAIL';
    result.message = 'Guardrail đã chặn nội dung này.';
    return result;
  }

  // 2. Role based category checks
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  
  if (!isOwnerOrAdmin) {
    if (userRole === 'UNKNOWN') {
      result.status = 'REJECTED';
      result.message = 'User without role cannot approve.';
      return result;
    }

    if (userRole === 'SALE' && request.category !== 'SALES' && request.category !== 'GENERAL') {
      result.status = 'REJECTED';
      result.message = 'SALE role cannot approve non-sales drafts.';
      return result;
    }

    if (userRole === 'TEACHER' && request.category !== 'ACADEMIC' && request.category !== 'GENERAL') {
      result.status = 'REJECTED';
      result.message = 'TEACHER role cannot approve non-academic drafts.';
      return result;
    }

    if (userRole === 'ACCOUNTANT' && request.category !== 'FINANCE' && request.category !== 'GENERAL') {
      result.status = 'REJECTED';
      result.message = 'ACCOUNTANT role cannot approve non-finance drafts.';
      return result;
    }
  }

  // 3. Risk level checks
  if (request.riskLevel === 'HIGH' || request.riskLevel === 'CRITICAL') {
    if (!isOwnerOrAdmin) {
      result.status = 'NEEDS_EDIT';
      result.message = 'High/Critical risk drafts require OWNER/ADMIN approval.';
      return result;
    }
  }

  // 4. If all checks pass
  if (request.guardrailStatus === 'NEEDS_REVIEW') {
    result.status = 'NEEDS_EDIT';
    result.canApproveForManualUse = true; // They can approve if they add a note or edit, but we return NEEDS_EDIT initially
    result.message = 'Cần xem xét kỹ trước khi duyệt.';
    return result;
  }

  result.status = 'APPROVED_FOR_MANUAL_USE';
  result.canApproveForManualUse = true;
  result.message = 'Nháp an toàn, có thể sử dụng thủ công.';

  return result;
}
