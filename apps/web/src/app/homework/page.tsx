import React from 'react';
import { ReportStatus } from '@eduos/db';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { prisma } from '@eduos/db';
import { HomeworkWorkspaceClient } from './HomeworkWorkspaceClient';

export default async function HomeworkPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/homework')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [homeworks, aiGradeDrafts, parentReports] = await Promise.all([
    prisma.homework.findMany({
      where: { tenantId },
      include: {
        class: {
          include: {
            teacher: true,
            enrollments: true,
          },
        },
        submissions: {
          include: {
            student: true,
            aiGradeDrafts: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { dueAt: 'desc' },
      take: 50,
    }),
    prisma.aiGradeDraft.findMany({
      where: { tenantId, isApproved: false },
      include: {
        submission: {
          include: {
            student: true,
            homework: {
              include: {
                class: { include: { teacher: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.weeklyParentReport.findMany({
      where: {
        tenantId,
        status: {
          in: [ReportStatus.DRAFT, ReportStatus.PENDING_TEACHER_REVIEW, ReportStatus.PENDING_ADMIN_APPROVAL],
        },
      },
      include: {
        student: true,
        guardian: true,
        class: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
  ]);

  const homeworkRows = homeworks.map((homework) => {
    const expectedSubmissions = homework.class.enrollments.length;
    const submissionCount = homework.submissions.length;
    const latestDraft = homework.submissions
      .flatMap((submission) => submission.aiGradeDrafts)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

    return {
      id: homework.id,
      title: homework.title,
      className: homework.class.classCode,
      teacherName: homework.class.teacher?.name || 'Chưa phân công',
      dueAt: homework.dueAt.toLocaleString('vi-VN'),
      status: homework.status,
      submissionCount,
      expectedSubmissions,
      missingSubmissionCount: Math.max(expectedSubmissions - submissionCount, 0),
      latestAiDraftStatus: latestDraft ? (latestDraft.isApproved ? 'Đã duyệt' : 'Chờ giáo viên duyệt') : 'Chưa có',
    };
  });

  const submissionRows = homeworks.flatMap((homework) =>
    homework.submissions.map((submission) => {
      const latestDraft = submission.aiGradeDrafts[0];
      return {
        id: submission.id,
        studentName: submission.student.name,
        className: homework.class.classCode,
        homeworkTitle: homework.title,
        submittedAt: submission.submittedAt.toLocaleString('vi-VN'),
        status: submission.status,
        aiDraftStatus: latestDraft ? (latestDraft.isApproved ? 'Đã duyệt' : 'Chờ giáo viên duyệt') : 'Chưa có',
        aiScore: latestDraft?.score ?? null,
      };
    }),
  );

  const draftRows = aiGradeDrafts.map((draft) => ({
    id: draft.id,
    studentName: draft.submission.student.name,
    className: draft.submission.homework.class.classCode,
    teacherName: draft.submission.homework.class.teacher?.name || 'Chưa phân công',
    homeworkTitle: draft.submission.homework.title,
    score: draft.score,
    comment: draft.comment,
    createdAt: draft.createdAt.toLocaleString('vi-VN'),
  }));

  const reportRows = parentReports.map((report) => ({
    id: report.id,
    studentName: report.student.name,
    guardianName: report.guardian?.name || 'Chưa có phụ huynh',
    guardianPhone: report.guardian?.phone || 'Chưa có SĐT',
    className: report.class?.classCode || 'Chưa gắn lớp',
    status: report.status,
    weekRange: `${report.weekStart.toLocaleDateString('vi-VN')} - ${report.weekEnd.toLocaleDateString('vi-VN')}`,
    draftContent: report.aiDraftContent,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Quản lý bài tập & học vụ"
        description="Theo dõi bài đã giao, duyệt AI chấm nháp và duyệt báo cáo phụ huynh từ dữ liệu thật."
        action={
          <span className="inline-flex h-10 items-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800">
            Pilot: duyệt bài & báo cáo từ DB
          </span>
        }
      />
      <HomeworkWorkspaceClient
        homeworkRows={homeworkRows}
        submissionRows={submissionRows}
        draftRows={draftRows}
        reportRows={reportRows}
      />
    </div>
  );
}
