import { prisma } from "@eduos/db";
// Mock AI internally for now
class MockAiProvider {
  async generateText(prompt: string, purpose: string) {
    return { text: `[DRAFT] ${prompt}` };
  }
}

interface ReportOptions {
  tenantId: string;
  weekStart: Date;
  weekEnd: Date;
  classId?: string;
  studentId?: string;
}

export async function generateWeeklyParentReportsForTenant(options: ReportOptions) {
  const { tenantId, weekStart, weekEnd, classId, studentId } = options;

  const whereStudent: any = { tenantId, deletedAt: null };
  if (studentId) whereStudent.id = studentId;
  if (classId) {
    whereStudent.enrollments = { some: { classId, status: "ACTIVE" } };
  }

  const students = await prisma.student.findMany({
    where: whereStudent,
    include: {
      guardian: true,
      attendances: {
        where: {
          session: { startTime: { gte: weekStart, lte: weekEnd } }
        },
        include: { session: { include: { class: true } } }
      },
      homeworkSubmissions: {
        where: { submittedAt: { gte: weekStart, lte: weekEnd } },
        include: { homework: true, feedbacks: true }
      },
      invoices: {
        where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } }
      },
      renewalCandidates: {
        where: { status: "NEW" }
      }
    }
  });

  const aiProvider = new MockAiProvider();
  let generatedCount = 0;

  for (const student of students) {
    if (!student.guardianId) continue;

    const attendances = student.attendances;
    const presentCount = attendances.filter(a => a.status === "PRESENT").length;
    const absentCount = attendances.filter(a => a.status === "ABSENT").length;
    const lateCount = attendances.filter(a => a.status === "LATE").length;
    const excusedCount = attendances.filter(a => a.status === "EXCUSED").length;
    const totalSessions = attendances.length;
    const attendanceRate = totalSessions > 0 ? (presentCount + lateCount) / totalSessions : 1;

    const submissions = student.homeworkSubmissions;
    const submittedCount = submissions.length;
    // Assuming 2 homeworks per week assigned if not strictly tracked for missing, but we can fake logic:
    const assignedCount = Math.max(submittedCount, totalSessions); // Basic approximation
    const missingCount = assignedCount - submittedCount;
    const submissionRate = assignedCount > 0 ? submittedCount / assignedCount : 1;

    let avgScore = 0;
    if (submissions.length > 0) {
      let totalScore = 0;
      let gradedCount = 0;
      submissions.forEach(s => {
        if (s.feedbacks && s.feedbacks.length > 0) {
          totalScore += s.feedbacks[0].score;
          gradedCount++;
        }
      });
      if (gradedCount > 0) {
        avgScore = totalScore / gradedCount;
      }
    }

    const unpaidInvoices = student.invoices.length;
    const isRenewal = student.renewalCandidates.length > 0;

    // Detect Risks
    const riskFlags: any[] = [];
    if (absentCount >= 2 || attendanceRate < 0.7) {
      riskFlags.push({ type: "ATTENDANCE_RISK", severity: "HIGH", reason: `Absent ${absentCount} times`, suggestedAction: "Call parent to check status", visibleToParent: true });
    }
    if (missingCount >= 2 || submissionRate < 0.7) {
      riskFlags.push({ type: "HOMEWORK_RISK", severity: "MEDIUM", reason: `Missing ${missingCount} homeworks`, suggestedAction: "Remind student to do homework", visibleToParent: true });
    }
    if (submittedCount > 0 && avgScore < 6.0) {
      riskFlags.push({ type: "LOW_SCORE_RISK", severity: "HIGH", reason: `Average score ${avgScore.toFixed(1)}`, suggestedAction: "Assign tutoring session", visibleToParent: true });
    }
    if (unpaidInvoices > 0) {
      riskFlags.push({ type: "PAYMENT_RISK", severity: "MEDIUM", reason: "Overdue tuition", suggestedAction: "Send polite reminder", visibleToParent: false });
    }
    if (isRenewal) {
      riskFlags.push({ type: "RENEWAL_RISK", severity: "LOW", reason: "Nearing course end", suggestedAction: "Prepare renewal pitch", visibleToParent: false });
    }
    if (totalSessions === 0 && submittedCount === 0) {
      riskFlags.push({ type: "INACTIVE_RISK", severity: "LOW", reason: "No activity this week", suggestedAction: "Check if on leave", visibleToParent: false });
    }

    const attendanceSummary = { present: presentCount, absent: absentCount, late: lateCount, excused: excusedCount, total: totalSessions };
    const homeworkSummary = { submitted: submittedCount, missing: missingCount, total: assignedCount };
    const gradingSummary = { avgScore };
    const rewardSummary = { starsEarned: 5 }; // Mock reward

    const promptText = `Generate weekly parent report for ${student.name}. Attendance: ${presentCount}/${totalSessions}. Homework: ${submittedCount}/${assignedCount}.`;
    let aiDraftContent = "";
    try {
      const aiResponse = await aiProvider.generateText(promptText, "weeklyParentReport");
      aiDraftContent = aiResponse.text;
    } catch (e) {
      aiDraftContent = `OMLIS xin chào phụ huynh của bé ${student.name} ạ 💛\nTuần này bé đã đi học ${presentCount}/${totalSessions} buổi và nộp ${submittedCount} bài tập. Bé rất ngoan và tích cực. Cảm ơn phụ huynh đã đồng hành cùng bé!`;
    }

    const report = await prisma.weeklyParentReport.upsert({
      where: {
        tenantId_studentId_weekStart_weekEnd: {
          tenantId,
          studentId: student.id,
          weekStart,
          weekEnd
        }
      },
      update: {
        attendanceSummaryJson: JSON.stringify(attendanceSummary),
        homeworkSummaryJson: JSON.stringify(homeworkSummary),
        gradingSummaryJson: JSON.stringify(gradingSummary),
        rewardSummaryJson: JSON.stringify(rewardSummary),
        riskFlagsJson: JSON.stringify(riskFlags),
        aiDraftContent,
        status: "DRAFT"
      },
      create: {
        tenantId,
        studentId: student.id,
        guardianId: student.guardianId,
        classId: attendances.length > 0 ? attendances[0].session.classId : null,
        weekStart,
        weekEnd,
        attendanceSummaryJson: JSON.stringify(attendanceSummary),
        homeworkSummaryJson: JSON.stringify(homeworkSummary),
        gradingSummaryJson: JSON.stringify(gradingSummary),
        rewardSummaryJson: JSON.stringify(rewardSummary),
        riskFlagsJson: JSON.stringify(riskFlags),
        aiDraftContent,
        status: "DRAFT"
      }
    });

    // Upsert Delivery
    await prisma.parentReportDelivery.upsert({
      where: { id: "never" }, // Prisma doesn't have unique constraint on delivery easily unless we use reportId, but reportId is unique enough if we search first
      // Actually we should findFirst and then update or create
      update: {},
      create: {
        tenantId,
        reportId: report.id,
        guardianId: student.guardianId!,
        targetChannel: "ZALO_PERSONAL",
        status: "DRAFT"
      }
    }).catch(async () => {
      const existingDelivery = await prisma.parentReportDelivery.findFirst({ where: { reportId: report.id } });
      if (!existingDelivery) {
        await prisma.parentReportDelivery.create({
          data: {
            tenantId,
            reportId: report.id,
            guardianId: student.guardianId!,
            targetChannel: "ZALO_PERSONAL",
            status: "DRAFT"
          }
        });
      }
    });

    generatedCount++;
  }

  return { generatedCount };
}

export async function approveParentReport(reportId: string, userId: string, teacherNote?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenantMembers: true }
  });
  if (!user) throw new Error("User not found");

  const report = await prisma.weeklyParentReport.findUnique({
    where: { id: reportId },
    include: { deliveries: true }
  });
  if (!report) throw new Error("Report not found");

  const tenantMember = user.tenantMembers.find((tu: any) => tu.tenantId === report.tenantId);
  if (!tenantMember) throw new Error("Not a tenant user");

  const allowedRoles = ["OWNER", "ADMIN", "TEACHER"];
  if (!allowedRoles.includes(tenantMember.role)) {
    throw new Error(`Role ${tenantMember.role} cannot approve parent reports`);
  }

  const finalContent = report.aiDraftContent + (teacherNote ? `\n\nNhận xét thêm từ giáo viên: ${teacherNote}` : "");

  const updatedReport = await prisma.weeklyParentReport.update({
    where: { id: reportId },
    data: { 
      status: "APPROVED",
      teacherNote,
      finalContent,
      approvedById: userId
    }
  });

  if (report.deliveries.length > 0) {
    await prisma.parentReportDelivery.updateMany({
      where: { reportId },
      data: { status: "PENDING_APPROVAL" }
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tenantId: report.tenantId,
      actorId: userId,
      entityType: "WeeklyParentReport",
      entityId: reportId,
      action: "APPROVE_PARENT_REPORT",
      metadataJson: JSON.stringify({ role: tenantMember.role })
    }
  });

  return updatedReport;
}
