import { prisma } from "@eduos/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getTodayAdmissionsSummary(tenantId: string) {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const [newLeads, newTrials, attendedTrials] = await Promise.all([
    prisma.lead.count({
      where: { tenantId, createdAt: { gte: start, lte: end } }
    }),
    prisma.trialBooking.count({
      where: { tenantId, createdAt: { gte: start, lte: end } }
    }),
    prisma.trialBooking.count({
      where: { tenantId, status: "ATTENDED", updatedAt: { gte: start, lte: end } }
    })
  ]);

  return { newLeads, newTrials, attendedTrials };
}

export async function getSalesPerformanceToday(tenantId: string) {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const wonLeads = await prisma.lead.count({
    where: { tenantId, stage: "WON", updatedAt: { gte: start, lte: end } }
  });

  const paymentsToday = await prisma.payment.aggregate({
    where: { tenantId, paidAt: { gte: start, lte: end } },
    _sum: { amount: true }
  });

  return { 
    wonLeads, 
    revenueToday: paymentsToday._sum.amount || 0 
  };
}

export async function getFinanceRiskSummary(tenantId: string) {
  const overdueInvoices = await prisma.invoice.count({
    where: { tenantId, status: "OVERDUE" }
  });

  const unpaidInvoices = await prisma.invoice.count({
    where: { tenantId, status: { in: ["UNPAID", "PARTIALLY_PAID"] } }
  });

  const overdueAmount = await prisma.invoice.aggregate({
    where: { tenantId, status: "OVERDUE" },
    _sum: { remainingAmount: true }
  });

  return {
    overdueInvoices,
    unpaidInvoices,
    totalOverdueAmount: overdueAmount._sum.remainingAmount || 0
  };
}

export async function getAcademicRiskSummary(tenantId: string) {
  // Students with consecutive absences
  // For simplicity in the fetcher, we check missing homeworks or recent absences
  const missingHomeworks = await prisma.homeworkSubmission.count({
    where: { tenantId, status: "SUBMITTED" } // Or not submitted, but here SUBMITTED means it needs grading.
  });
  
  // Real check: we just count needs review attendance
  const needsReviewAttendance = await prisma.attendance.count({
    where: { tenantId, status: "NEEDS_REVIEW" }
  });

  return {
    missingHomeworks,
    needsReviewAttendance
  };
}

export async function getParentReportPendingSummary(tenantId: string) {
  const pendingReports = await prisma.weeklyParentReport.count({
    where: { tenantId, status: "PENDING_ADMIN_APPROVAL" }
  });
  const draftReports = await prisma.weeklyParentReport.count({
    where: { tenantId, status: "DRAFT" }
  });

  return { pendingReports, draftReports };
}

export async function getZaloFacebookHealthSummary(tenantId: string) {
  const failedZaloMessages = await prisma.zaloOutboxMessage.count({
    where: { tenantId, status: "FAILED" }
  });

  const offlineConnectors = await prisma.zaloConnectorSession.count({
    where: { tenantId, status: { not: "ONLINE" } }
  });

  const offlineFacebookPages = await prisma.facebookPage.count({
    where: { tenantId, isActive: false }
  });

  const totalFacebookPages = await prisma.facebookPage.count({
    where: { tenantId }
  });

  return { failedZaloMessages, offlineConnectors, offlineFacebookPages, totalFacebookPages };
}

export async function getAiDraftsPendingApproval(tenantId: string) {
  const pendingDrafts = await prisma.aiActionDraft.count({
    where: { tenantId, status: "PENDING_APPROVAL" }
  });

  return { pendingDrafts };
}

export async function getCriticalAlertsSummary(tenantId: string) {
  const [finance, academic, reports, health, ai] = await Promise.all([
    getFinanceRiskSummary(tenantId),
    getAcademicRiskSummary(tenantId),
    getParentReportPendingSummary(tenantId),
    getZaloFacebookHealthSummary(tenantId),
    getAiDraftsPendingApproval(tenantId)
  ]);

  let criticalCount = 0;
  if (finance.overdueInvoices > 0) criticalCount++;
  if (health.offlineConnectors > 0) criticalCount++;
  if (health.failedZaloMessages > 0) criticalCount++;
  if (health.offlineFacebookPages > 0) criticalCount++;

  return {
    finance,
    academic,
    reports,
    health,
    ai,
    criticalCount
  };
}
