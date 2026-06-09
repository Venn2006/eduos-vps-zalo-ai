"use server";

import { createAuditLog, prisma, ReportStatus, SubmissionStatus } from "@eduos/db";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveAiGradeDraft(draftId: string) {
  const session = await requireRole(["OWNER", "ADMIN", "TEACHER"]);
  const tenantId = session.activeTenantId;

  const draft = await prisma.aiGradeDraft.findFirst({
    where: { id: draftId, tenantId },
    include: {
      submission: {
        include: {
          homework: { include: { class: true } },
          student: true,
        },
      },
    },
  });

  if (!draft) throw new Error("Không tìm thấy bản chấm nháp.");
  if (draft.isApproved) return { ok: true, alreadyApproved: true };

  const result = await prisma.$transaction(async (tx) => {
    const approvedDraft = await tx.aiGradeDraft.update({
      where: { id: draft.id },
      data: { isApproved: true },
    });

    const updatedSubmission = await tx.homeworkSubmission.update({
      where: { id: draft.submissionId },
      data: { status: SubmissionStatus.TEACHER_REVIEWED },
    });

    const teacherId = draft.submission.homework.class.teacherId;
    if (teacherId) {
      await tx.teacherFeedback.create({
        data: {
          tenantId,
          submissionId: draft.submissionId,
          teacherId,
          score: draft.score,
          comment: draft.comment,
        },
      });
    }

    return { approvedDraft, updatedSubmission };
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: "AI_GRADE_DRAFT_APPROVED",
    entityType: "AiGradeDraft",
    entityId: draft.id,
    beforeJson: { isApproved: draft.isApproved, submissionStatus: draft.submission.status },
    afterJson: {
      isApproved: result.approvedDraft.isApproved,
      submissionStatus: result.updatedSubmission.status,
      score: result.approvedDraft.score,
    },
    metadataJson: { source: "homework_action" },
  });

  revalidatePath("/homework");
  revalidatePath("/workspaces/teacher");

  return { ok: true, alreadyApproved: false };
}

export async function approveWeeklyParentReport(reportId: string) {
  const session = await requireRole(["OWNER", "ADMIN", "TEACHER"]);
  const tenantId = session.activeTenantId;

  const report = await prisma.weeklyParentReport.findFirst({
    where: { id: reportId, tenantId },
    select: { id: true, status: true, finalContent: true, aiDraftContent: true },
  });

  if (!report) throw new Error("Không tìm thấy báo cáo phụ huynh.");
  if (report.status === ReportStatus.SENT) {
    throw new Error("Báo cáo đã gửi, không thể duyệt lại.");
  }

  const updatedReport = await prisma.weeklyParentReport.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.APPROVED,
      approvedById: session.userId,
      finalContent: report.finalContent || report.aiDraftContent,
    },
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: "WEEKLY_PARENT_REPORT_APPROVED",
    entityType: "WeeklyParentReport",
    entityId: report.id,
    beforeJson: { status: report.status },
    afterJson: { status: updatedReport.status, approvedById: updatedReport.approvedById },
    metadataJson: { source: "homework_action", delivery: "not_sent" },
  });

  revalidatePath("/homework");
  return { ok: true };
}
