import React from 'react';
import { prisma } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageGuidanceBanner } from '@/components/ui/PageGuidanceBanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import type { CrmLead, CrmTask, CrmTimelineEvent, LifecycleStage, LeadRisk, LeadStage } from '@/lib/crmTypes';
import type { StudentRiskLevel } from '@/lib/studentCareRisk';
import { IntegrationButton } from './CrmActions';
import { CrmCommandCenterClient } from './CrmCommandCenterClient';

export default async function CrmCommandCenterPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/crm-command-center')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [dbLeads, followUpTasks, members] = await Promise.all([
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        source: true,
        course: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        trialBookings: { orderBy: { trialDate: 'desc' }, take: 5 },
        callAttempts: { orderBy: { calledAt: 'desc' }, take: 5 },
        followUpTasks: { orderBy: { dueDate: 'desc' }, take: 5 },
      },
    }),
    prisma.followUpTask.findMany({
      where: { tenantId, isCompleted: false },
      include: { lead: true },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),
    prisma.tenantMember.findMany({
      where: { tenantId },
      include: { user: { select: { email: true } } },
    }),
  ]);

  const memberByUserId = new Map(members.map((member) => [member.userId, member.user.email]));
  const now = await getServerNowMs();

  const mappedLeads: CrmLead[] = dbLeads.map((lead) => {
    const stage = mapLeadStage(lead.stage);
    const lifecycleStage = mapLifecycleStage(lead.stage);
    const lastActivityAt = lead.activities[0]?.createdAt || lead.lastCallAt || lead.updatedAt || lead.createdAt;
    const lastInteractionDays = Math.max(0, Math.floor((now - lastActivityAt.getTime()) / (24 * 60 * 60 * 1000)));
    const hasOverdueViệc = lead.followUpTasks.some((việc) => !việc.isCompleted && việc.dueDate.getTime() < now);
    const hasComplaint = lead.activities.some((activity) => `${activity.type} ${activity.notes || ''}`.toLowerCase().includes('complaint'));
    const careRiskLevel: StudentRiskLevel = hasComplaint
      ? 'Khiếu nại/Cần handoff'
      : hasOverdueViệc || lastInteractionDays >= 3
        ? 'Cần chú ý'
        : 'Bình thường';
    const riskBadge = getRiskBadge(stage, lead.temperature, hasOverdueViệc, hasComplaint);

    return {
      id: lead.id,
      name: lead.name,
      parentName: lead.parentName || undefined,
      phone: lead.phone || 'Chưa có SĐT',
      source: lead.source?.name || lead.sourceId || 'Lead DB',
      assignedStaff: lead.assignedToId ? memberByUserId.get(lead.assignedToId) || 'Chưa rõ nhân sự' : 'Chưa chia',
      stage,
      lifecycleStage,
      riskBadge,
      careMetrics: {
        recentAbsences: 0,
        homeworkMissing: 0,
        parentSentiment: hasComplaint ? 'NEGATIVE' : 'NEUTRAL',
        debtOverdueDays: 0,
        trialMissed: lead.trialBookings.some((trial) => trial.status === 'NO_SHOW'),
        unansweredDays: lastInteractionDays,
        hasComplaint,
      },
      careRiskLevel,
      lastInteractionTime: lastActivityAt.toLocaleString('vi-VN'),
      lastInteractionDays,
      nextAction: nextActionForLead(lead.stage, hasOverdueViệc),
      aiSuggestion: '',
      timeline: buildLeadTimeline(lead),
      classInfo: lead.course?.name,
    };
  });

  const mappedViệcs: CrmTask[] = followUpTasks.map((việc): CrmTask => ({
    id: việc.id,
    title: việc.description,
    owner: việc.assignedTo ? memberByUserId.get(việc.assignedTo) || 'Chưa rõ nhân sự' : 'Chưa giao',
    dueTime: việc.dueDate.toLocaleString('vi-VN'),
    leadName: việc.lead.name,
    sourceChannel: việc.lead.sourceId || 'CRM',
    status: việc.dueDate.getTime() < now ? 'QUÁ HẠN' : 'MỚI',
    suggestedNextStep: việc.description,
    automationMode: 'MANUAL_FOLLOW_UP',
    priority: việc.dueDate.getTime() < now ? 'HIGH' : 'MEDIUM',
    category: 'FOLLOW_UP',
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageGuidanceBanner
        title="Quản lý khách hàng (CRM)"
        description="Dữ liệu lấy từ khách và việc chăm sóc thật trong trung tâm. Không dùng dữ liệu mẫu khi chưa có khách."
      />
      <SectionHeader
        title="Trung tâm khách hàng & tin nhắn"
        description="Theo dõi phễu tư vấn, lịch sử chăm sóc, việc việc chăm sóc và rủi ro chăm sóc khách hàng."
        action={<IntegrationButton />}
      />

      <CrmCommandCenterClient
        staffAccounts={[]}
        classGroups={[]}
        leads={mappedLeads}
        việcs={mappedViệcs}
      />
    </div>
  );
}

function mapLeadStage(stage: string): LeadStage {
  if (stage === 'REGISTERED') return 'DA_CHOT';
  if (stage === 'NOT_POTENTIAL' || stage === 'NO_NEED') return 'MAT_LEAD';
  if (stage === 'TRIALING' || stage === 'TRIALED') return 'DA_HOC_THU';
  if (stage === 'WAITING_TRIAL') return 'DA_HEN_HOC_THU';
  if (stage === 'CALLBACK' || stage === 'INTERESTED' || stage === 'POTENTIAL') return 'DA_LIEN_HE';
  return 'LEAD_MOI';
}

function mapLifecycleStage(stage: string): LifecycleStage {
  if (stage === 'REGISTERED') return 'STUDENT_ACTIVE';
  if (stage === 'TRIALING' || stage === 'TRIALED') return 'TRIAL_ATTENDED';
  if (stage === 'WAITING_TRIAL') return 'TRIAL_BOOKED';
  if (stage === 'CALLBACK' || stage === 'INTERESTED' || stage === 'POTENTIAL') return 'LEAD_CONTACTED';
  return 'LEAD_NEW';
}

function getRiskBadge(stage: LeadStage, temperature: string, hasOverdueViệc: boolean, hasComplaint: boolean): LeadRisk {
  if (hasComplaint) return 'CẦN HANDOFF';
  if (hasOverdueViệc) return 'QUÁ HẠN';
  if (stage === 'DA_CHOT' || stage === 'MAT_LEAD') return 'LẠNH';
  if (temperature === 'HOT') return 'NÓNG';
  if (temperature === 'COLD') return 'LẠNH';
  return 'ẤM';
}

function nextActionForLead(stage: string, hasOverdueViệc: boolean) {
  if (hasOverdueViệc) return 'Xử lý việc chăm sóc quá hạn';
  if (stage === 'NEW' || stage === 'NO_ANSWER') return 'Gọi xác nhận nhu cầu';
  if (stage === 'WAITING_TRIAL') return 'Nhắc lịch học thử';
  if (stage === 'TRIALING' || stage === 'TRIALED') return 'Chăm sóc sau học thử';
  if (stage === 'REGISTERED') return 'Theo dõi hồ sơ học viên';
  return 'Ghi chú chăm sóc tiếp theo';
}

function buildLeadTimeline(lead: {
  id: string;
  name: string;
  createdAt: Date;
  activities: Array<{ id: string; type: string; notes: string | null; createdAt: Date }>;
  trialBookings: Array<{ id: string; trialDate: Date; status: string; noteSnapshot: string | null }>;
  callAttempts: Array<{ id: string; outcome: string; notes: string | null; calledAt: Date }>;
  followUpTasks: Array<{ id: string; description: string; dueDate: Date; isCompleted: boolean }>;
}): CrmTimelineEvent[] {
  const events: CrmTimelineEvent[] = [
    {
      id: `${lead.id}:created`,
      type: 'LEAD_CREATED',
      title: 'Lead được tạo',
      description: `Lead ${lead.name} được ghi nhận trong CRM.`,
      timestamp: lead.createdAt.toLocaleString('vi-VN'),
      source: 'CRM',
      actor: 'Hệ thống',
    },
    ...lead.activities.map((activity): CrmTimelineEvent => ({
      id: activity.id,
      type: 'STAFF_REPLY',
      title: activity.type === 'NOTE' ? 'Ghi chú chăm sóc' : activity.type,
      description: activity.notes || 'Không có nội dung ghi chú.',
      timestamp: activity.createdAt.toLocaleString('vi-VN'),
      source: 'CRM',
      actor: 'Nhân viên',
    })),
    ...lead.trialBookings.map((trial): CrmTimelineEvent => ({
      id: trial.id,
      type: trial.status === 'NO_SHOW' ? 'TRIAL_MISSED' : 'TRIAL_BOOKED',
      title: trial.status === 'NO_SHOW' ? 'Lỡ lịch học thử' : 'Lịch học thử',
      description: trial.noteSnapshot || `Trạng thái: ${trial.status}`,
      timestamp: trial.trialDate.toLocaleString('vi-VN'),
      source: 'Trial booking',
      actor: 'CRM',
    })),
    ...lead.callAttempts.map((call): CrmTimelineEvent => ({
      id: call.id,
      type: 'STAFF_REPLY',
      title: `Cuộc gọi: ${call.outcome}`,
      description: call.notes || 'Không có ghi chú cuộc gọi.',
      timestamp: call.calledAt.toLocaleString('vi-VN'),
      source: 'Call',
      actor: 'Sale',
    })),
    ...lead.followUpTasks.map((việc): CrmTimelineEvent => ({
      id: việc.id,
      type: việc.isCompleted ? 'TASK_COMPLETED' : 'TASK_CREATED',
      title: việc.isCompleted ? 'Việc đã hoàn tất' : 'Việc việc chăm sóc',
      description: việc.description,
      timestamp: việc.dueDate.toLocaleString('vi-VN'),
      source: 'Việc',
      actor: 'CRM',
    })),
  ];

  return events.sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));
}

async function getServerNowMs() {
  return Date.now();
}
